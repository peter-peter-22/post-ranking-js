import { PersonalPost } from "@me/schemas/src/zod/post"
import { SearchReply } from "redis"
import { User } from "../../db/schema/users"
import { HttpError } from "../../middlewares/errorHandler"
import { escapeTagValue } from "../../redis/common"
import { redisClient } from "../../redis/connect"
import { postsPerRequest } from "../../redis/feeds/postFeeds/common"
import { cachedPosts, postHsetSchema } from "../../redis/postContent"
import { enrichPostArray } from "../../redis/postContent/enrich"
import { repliersRedisKey } from "../../redis/postContent/replies"
import { userFollowingRedisKey } from "../../redis/users/follows"
import { deduplicatePosts, SingleDatePageParams } from "../common"

export type CommentsPageParams = {
    latest?: SingleDatePageParams
}

export async function getReplies({ user, pageParams, offset, postId }: { user: User, pageParams?: CommentsPageParams, offset: number, postId: string }) {
    // Get the main post and metadata
    const [post, followedRepliers] = await Promise.all([
        cachedPosts.readSingle(postId),
        redisClient.sInter([repliersRedisKey(postId), userFollowingRedisKey(user.id)]),
    ])

    // Check if the post exists
    if (!post) throw new HttpError(404, 'Post not found')

    // Get if this is the first page
    const firstPage = offset === 0

    // Get replies from redis
    const multi = redisClient.multi()
    // Newest replies
    const maxDate = pageParams?.latest
    multi.ft.search(
        'posts',
        maxDate ?
            `@replyingTo:{${escapeTagValue(post.id)}} @createdAt:[-inf ${maxDate}]`
            :
            `@replyingTo:{${escapeTagValue(post.id)}}`,
        {
            SORTBY: { BY: 'createdAt', DIRECTION: "DESC" },
            LIMIT: { from: 0, size: postsPerRequest }
        }
    );
    if (firstPage) {
        // Replies of the author
        multi.ft.search(
            'posts',
            `@replyingTo:{${escapeTagValue(post.id)}} @userId:{${escapeTagValue(post.userId)}}`,
        );
        // Replies of followed users
        for (const followed of followedRepliers)
            multi.ft.search(
                'posts',
                `@replyingTo:{${escapeTagValue(post.id)}} @userId:{${escapeTagValue(followed)}}`,
            );
    }

    const results = await multi.exec() as (SearchReply | undefined)[]

    // Parse all results
    const replyGroups = results.map(result => result ? postHsetSchema.parseSearch(result) : [])
    const allReplies = deduplicatePosts(replyGroups.flat())
    if (allReplies.length === 0) return

    // Get next page param 
    const latestReplies = replyGroups[0]
    const nextPageParams: CommentsPageParams = {
        latest: {
            maxDate: latestReplies[latestReplies.length - 1]?.createdAt.toISOString()
        }
    }

    // Enrich posts
    let enrichedReplies = await enrichPostArray(allReplies, user)

    // Rank
    enrichedReplies = orderReplies(enrichedReplies, post.userId)

    // Return the ranked posts and the page params
    return { data: enrichedReplies, pageParams: nextPageParams }
}

/** Order the replies by group then importance */
function orderReplies(replies: PersonalPost[], publisherId: string) {
    return replies.sort((a, b) => {
        // Get the group priorities
        const groupA = getReplyGroup(a, publisherId)
        const groupB = getReplyGroup(b, publisherId)
        // If both comments are from the publisher, order by date ascending
        if (groupA === 2 && groupB === 2) return a.createdAt.getTime() - b.createdAt.getTime()
        // Order by group priority if not equal
        if (groupA !== groupB) return groupB - groupA
        // Order by date, descending
        return b.createdAt.getTime() - a.createdAt.getTime()
    })
}

/** Return the group priority of a reply. 2=publisher, 1=following, 0=other */
function getReplyGroup(reply: PersonalPost, publisherId: string) {
    return reply.user.id === publisherId ? 2 : reply.user.followed ? 1 : 0
}