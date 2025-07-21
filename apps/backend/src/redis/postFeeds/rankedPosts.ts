import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { HttpError } from "../../middlewares/errorHandler";
import { redisClient } from "../connect";
import { candidateColumns } from "../../posts/common";
import { personalizePosts, PersonalPost } from "../../posts/hydratePosts";
import { minCandidates, postFeedTTL, postsPerRequest } from "./common";

type PostFeedMeta<TPageParams> = {
    previousPostCount?: number,
    hasMore: boolean,
    pageParams?: TPageParams
}

type ZSetEntry = {
    value: string,
    score: number
}

export async function getPaginatedRankedPosts<TPageParams>({
    getMore,
    feedName,
    user,
    offset,
    minRemaining = minCandidates,
    ttl = postFeedTTL
}: {
    getMore: (pageParams?: TPageParams) => Promise<{ posts: PersonalPost[], pageParams: TPageParams } | undefined>,
    feedName: string,
    user: User,
    offset: number,
    minRemaining?: number,
    ttl?: number
}) {
    console.log(`Requested ranked post feed "${feedName}" for user "${user.id}", offset: ${offset}`)
    const key = `postFeeds/${feedName}/${user.id}`
    const metaKey = key + ":meta"
    const listKey = key + ":list"

    // If this is the first page, fetch new post and overwrite redis
    if (offset === 0) {
        // Fetch new posts
        const data = await getMore()

        // If no posts returned, exit
        if (!data || data.posts.length === 0) {
            console.log("No data fetched")
            return []
        }

        const { posts, pageParams } = data
        console.log(`Fetched ${posts.length} posts.`)

        // Get the first page of posts to return
        const returnPosts = posts.slice(0, postsPerRequest)

        // Delete the previous list, save the new list and the metadata to redis
        await redisClient.multi()
            .del(listKey)
            .zAdd(listKey, postsToZSet(posts))
            .expire(listKey, ttl)
            .setEx(metaKey, ttl, JSON.stringify({
                previousPostCount: 0,
                hasMore: true,
                pageParams
            } satisfies PostFeedMeta<TPageParams>))
            .exec()

        // Return the posts
        return returnPosts
    }
    else {
        // Fetch the metadata and the post count from redis
        let [meta_, postCount_] = await redisClient.multi()//TODO: extend expiration
            .getEx(metaKey,{EX:ttl})
            .expire(listKey, ttl)
            .zCard(listKey)
            .exec()

        // Check if the feed expired
        if (!meta_ || !postCount_) throw new HttpError(400, "Feed expired")

        // Parse the returned data
        const meta = JSON.parse(meta_ as string) as PostFeedMeta<TPageParams>
        const postCount = postCount_ as number
        const localOffset = offset - (meta.previousPostCount ?? 0)
        const remaining = postCount - localOffset
        console.log(`Local offset: ${localOffset}, post count: ${postCount}, previous post count: ${meta.previousPostCount ?? 0}, remaining: ${remaining}, has more: ${meta.hasMore}`)

        // If enough posts are remaining, convert a page of ids to posts and return them
        if (remaining >= minRemaining || !meta.hasMore) {
            const postIds = await redisClient.zRangeWithScores(listKey, localOffset, localOffset + postsPerRequest - 1)
            console.log(`Loaded ${postIds.length} posts from the list, ${remaining - postIds.length} remains.`)
            return await postsFromIds(postIds, user)
        }
        console.log(`Less posts are remaining than the minimum, ${minRemaining}`)

        // If more posts must be fetched, but there are no more, exit
        if (!meta.hasMore) {
            console.log("No more posts to fetch, end of feed")
            return []
        }

        // Fetch new posts
        console.log("Fetching posts with page params:", meta.pageParams)
        const data = await getMore(meta.pageParams)

        // If no new posts were returned, continue to send the remaining posts from redis
        if (!data || data.posts.length === 0) {
            // Prevent future attempts to fetch new posts and get a page of posts
            console.log("Attempted to fetch posts, but nothing was returned, sending the remaining posts.")
            const res = await redisClient.multi()
                .zRangeWithScores(listKey, localOffset, localOffset + postsPerRequest - 1)
                .setEx(metaKey, ttl, JSON.stringify({
                    ...meta,
                    hasMore: false,
                } satisfies PostFeedMeta<TPageParams>))
                .exec()

            // Get the posts of the ids
            const postIds = res[0] as unknown as ZSetEntry[]
            console.log(`Loaded ${postIds.length} posts from the list, ${remaining - postIds.length} remains.`)
            return await postsFromIds(postIds, user)
        }

        const { posts, pageParams } = data
        const newRemaining = posts.length + remaining
        console.log(`Fetched ${posts.length} new posts, ${newRemaining} remains in total`)

        // If new posts were fetched, delete the previous posts, add the new ones to redis, and return a page of ids
        const res = await redisClient.multi()
            .zPopMinCount(listKey, localOffset)
            .zAdd(listKey, postsToZSet(posts))
            .zRangeWithScores(listKey, 0, postsPerRequest - 1)
            .setEx(metaKey, ttl, JSON.stringify({
                previousPostCount: offset,
                hasMore: true,
                pageParams
            } satisfies PostFeedMeta<TPageParams>))
            .exec()

        // Convert the returned ids to posts and return them
        const newPostIds = res[2] as unknown as ZSetEntry[]
        console.log(`Returning ${newPostIds.length} posts, ${newRemaining - newPostIds.length} remains`)
        return await postsFromIds(newPostIds, user)
    }
}

/** Convert ranked posts to data that can be added to a zset. */
function postsToZSet(posts: PersonalPost[]) {
    return posts.map(post => ({ value: post.id, score: post.score ?? 0 }))
}

/** Fetch the posts of the provided ids. */
async function postsFromIds(ids: ZSetEntry[], user: User) {
    // Exit of no ids provided
    if (ids.length === 0) return []

    // Fetch the posts
    const postsSq = db
        .select(candidateColumns("Unknown"))
        .from(posts)
        .where(inArray(posts.id, ids.map(id => id.value)))
        .$dynamic()
    const myPosts: PersonalPost[] = await personalizePosts(postsSq, user)

    // Apply the original order and score of the zset to the returned posts
    const orderedPosts: PersonalPost[] = []
    ids.forEach(id => {
        const post = myPosts.find(p => p.id === id.value)
        if (!post) return
        post.score = id.score
        orderedPosts.push(post)
    })
    return orderedPosts
}