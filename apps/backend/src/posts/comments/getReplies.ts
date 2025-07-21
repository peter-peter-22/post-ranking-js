import { eq } from "drizzle-orm"
import { db } from "../../db"
import { posts } from "../../db/schema/posts"
import { User } from "../../db/schema/users"
import { HttpError } from "../../middlewares/errorHandler"
import { deduplicatePosts, mergePostArrays, SingleDatePageParams } from "../common"
import { noPending, replyOfPost } from "../filters"
import { PersonalPost } from "../hydratePosts"
import { getFollowedComments } from "./sections/followed"
import { getOtherComments } from "./sections/others"
import { getPublisherComments } from "./sections/publisher"

export type CommentsPageParams = {
    rest?: SingleDatePageParams
}

export async function getReplies({ user, pageParams, offset, postId }: { user: User, pageParams?: CommentsPageParams, offset: number, postId: string }) {
    // Get the main post 
    const post = await getMainPost(postId)

    // Get if this is the first page
    const firstPage = offset === 0

    const [publisherPosts, followedPosts, otherPosts] = await Promise.all([
        getPublisherComments({ post, user, firstPage }),
        getFollowedComments({ post, user, firstPage }),
        getOtherComments({ post, user, firstPage, pageParams: pageParams?.rest }),
    ])

    // Merge the posts
    let allPosts = mergePostArrays([publisherPosts?.posts, followedPosts?.posts, otherPosts?.posts])
    // Exit if no posts
    if (allPosts.length === 0) return
    // Deduplicate
    allPosts = deduplicatePosts(allPosts)
    // Merge page params
    const allPageParams: CommentsPageParams = {
        rest: otherPosts?.pageParams,
    }
    // Rank
    allPosts = await orderReplies(allPosts,post.userId)
    // Return the ranked posts and the page params
    return { data: allPosts, pageParams: allPageParams }
}

async function getMainPost(postId: string) {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))
    if (!post)
        throw new HttpError(404, 'Post not found')
    return post
}

/** Order the replies by group then importance */
function orderReplies(replies: PersonalPost[], publisherId: string) {
    return replies.sort((a, b) => {
        // Get the group priorities
        const groupA = getReplyGroup(a, publisherId)
        const groupB = getReplyGroup(b, publisherId)
        // If both comments are from the publisher, order by date
        if (groupA === 2 && groupB === 2) return b.createdAt.getTime() - a.createdAt.getTime()
        // Order by group priority if not equal
        if (groupA !== groupB) return groupB - groupA
        // Order by score if the scores are not equal
        if (a.commentScore !== b.commentScore) return b.commentScore - a.commentScore
        // Order by date otherwise
        return b.createdAt.getTime() - a.createdAt.getTime()
    })
}

/** Return the group priority of a reply. 2=publisher, 1=following, 0=other */
function getReplyGroup(reply: PersonalPost, publisherId: string) {
    return reply.user.id === publisherId ? 2 : reply.user.followed ? 1 : 0
}

/** Filters shared by all reply selectors */
export function replyCommonFilters(postId: string) {
    return [
        replyOfPost(postId),
        noPending()
    ]
}