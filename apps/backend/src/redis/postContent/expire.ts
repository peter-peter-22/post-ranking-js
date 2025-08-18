import { SearchReply } from "redis"
import { postContentRedisKey, postLikersRedisKey } from "."
import { Post, posts, PostToInsert } from "../../db/schema/posts"
import { bulkUpdateFromValues } from "../../db/utils/bulkUpdate"
import { currentTimeS, postTTL, RedisMulti } from "../common"
import { redisClient } from "../connect"
import { typedHSet } from "../typedHSet"
import { repliersRedisKey } from "./replies"

const minimizedPostColumns = ["id", "commentsExists", "likeCount", "replyCount", "clickCount", "viewCount"]

type MiniPost = Pick<Post, "id" | "commentsExists" | "likeCount" | "replyCount" | "clickCount" | "viewCount">

const minimizedPostHsetSchema = typedHSet<MiniPost>({
    id: "string",
    commentsExists: "boolean",
    likeCount: "number",
    replyCount: "number",
    clickCount: "number",
    viewCount: "number",
})

// General

const maxCount = 1000

/** Update the expiration of the post or the root post if this is a reply. */
export function touchPost(multi: RedisMulti, post: Post) {
    const updates = {
        publicExpires: currentTimeS() + postTTL
    }
    if (post.rootPostId)
        multi.hSet(
            postContentRedisKey(post.rootPostId),
            updates
        )
    else
        multi.hSet(
            postContentRedisKey(post.id),
            updates
        )

}

// Public

async function handlePostsPublicDataExpiration() {
    const expiredPosts = await getPostsPublicDataToRemove()
    await savePostsPublicData(expiredPosts)
    const multi = redisClient.multi()
    removePostsPublicData(expiredPosts, multi)
    await multi.exec()
}

async function getPostsPublicDataToRemove() {
    // Get expired root level posts
    const time = currentTimeS()
    const postResults = await redisClient.ft.search('posts',
        `@publicExpires:[-inf ${time}] @rankingExpires:[-inf ${time}] @isReply:{0}`,
        {
            LIMIT: { from: 0, size: maxCount },
            RETURN: minimizedPostColumns
        }
    );
    const expiredPosts = minimizedPostHsetSchema.parseSearch(postResults)
    // Get their comments
    const postsWithComments = expiredPosts.filter(p => p.commentsExists)
    const multi = redisClient.multi()
    for (const post of postsWithComments)
        multi.ft.search('posts',
            `@rootPostId:{${post.id}}`,
            {
                RETURN: minimizedPostColumns
            }
        );
    const replyResults = await multi.exec() as (SearchReply | undefined)[]
    const expiredReplies = replyResults.flatMap(r => r ? minimizedPostHsetSchema.parseSearch(r) : [])
    // Merge post and replies arrays
    return [...expiredPosts, ...expiredReplies]
}

async function savePostsPublicData(expiredPosts: MiniPost[]) {
    const updates: Partial<PostToInsert>[] = expiredPosts.map(p => ({
        id: p.id,
        likeCount: p.likeCount,
        replyCount: p.replyCount,
        clickCount: p.clickCount,
        viewCount: p.viewCount
    }))
    await bulkUpdateFromValues({
        table: posts,
        rows: updates,
        key: "id",
        updateCols: ["likeCount", "replyCount", "clickCount", "viewCount"]
    })
}

function removePostsPublicData(expiredPosts: MiniPost[], multi: RedisMulti) {
    for (const post of expiredPosts) {
        multi.del(postContentRedisKey(post.id))
        multi.del(repliersRedisKey(post.id))
    }
}

// Ranked

async function handlePostsRankingDataExpiration() {
    const expiredPosts = await getPostsRankedDataToRemove()
    const multi = redisClient.multi()
    expirePostsRankingData(expiredPosts, multi)
    await multi.exec()
}

async function getPostsRankedDataToRemove() {
    const time = currentTimeS()
    const query = `@rankingExists:{0} @rankingExpires:[-inf ${time}]`;
    const results = await redisClient.ft.search('posts', query, {
        LIMIT: { from: 0, size: maxCount },
        RETURN: minimizedPostColumns
    });
    const posts = minimizedPostHsetSchema.parseSearch(results)
    console.log(`Expiring ${posts.length} ranked posts.`)
    return posts
}

function expirePostsRankingData(expiredPosts: MiniPost[], multi: RedisMulti) {
    for (const post of expiredPosts) {
        multi.del(postLikersRedisKey(post.id))
    }
}

// Aggregate

export async function handleAllPostExpirations() {
    await handlePostsRankingDataExpiration()
    await handlePostsPublicDataExpiration()
}