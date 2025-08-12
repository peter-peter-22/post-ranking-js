import { PersonalPost } from "@me/schemas/src/zod/post";
import { cachedPosts } from ".";
import { Post } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { postProcessPosts } from "../../posts/postProcessPosts";
import { cosineSimilarity } from "../../utilities/arrays/cosineSimilarity";
import { removeUndefinedMapValues } from "../../utilities/arrays/removeUndefinedMapValues";
import { cachedClicks, cachedLikes, cachedViews } from "../personalEngagements/instances";
import { getEngagementHistoryScores } from "../users/engagementHistory";
import { getEnrichedUsers } from "../users/enrich";
import { getFollowedReplierCounts } from "./replies";

export async function enrichPostSet(posts: Map<string, Post>, viewer?: User) {
    // Format 
    const postIds: string[] = []
    const userIdSet: Set<string> = new Set()
    for (const post of posts.values()) {
        postIds.push(post.id)
        userIdSet.add(post.userId)
    }
    const userIds = [...userIdSet]
    const viewerId = viewer?.id
    // Fetch
    const [users, likes, views, clicks, engagementHistories, followedReplierCounts] = await Promise.all([
        getEnrichedUsers(userIds, viewerId),
        viewerId ? cachedLikes.get(postIds, viewerId, posts) : undefined,
        viewerId ? cachedViews.get(postIds, viewerId, posts) : undefined,
        viewerId ? cachedClicks.get(postIds, viewerId, posts) : undefined,
        viewerId ? getEngagementHistoryScores(viewerId, userIds) : undefined,
        viewerId ? getFollowedReplierCounts(viewerId, [...posts.values()]) : undefined
    ])
    // Aggregate
    const enrichedPosts: PersonalPost[] = [...posts.values()].map((post, i) => {
        const liked = likes?.get(post.id) || false;
        const viewed = views?.get(post.id) || false;
        const clicked = clicks?.get(post.id) || false;
        const engagementHistoryScore = engagementHistories?.[i] || 0
        const user = users.get(post.userId)
        const followedReplierCount = followedReplierCounts?.[i] || 0
        if (!user) throw new Error("Missing user")
        return {
            id: post.id,
            userId: post.userId,
            text: post.text,
            createdAt: post.createdAt,
            likes: post.likeCount,
            replies: post.replyCount,
            clicks: post.clickCount,
            views: post.viewCount,
            engagementCount: post.engagementCount,
            similarity: viewer && viewer.embedding && post.embedding ? cosineSimilarity(post.embedding, viewer.embedding) : 0,
            engagementHistoryScore,
            repliedByFollowed: false,
            followedReplierCount,
            liked: liked,
            viewed: viewed,
            clicked: clicked,
            user: user,
            media: post.media,
            commentScore: post.commentScore,
            replyingTo: post.replyingTo,
            deleted: post.deleted,
            //debug
            keywords: post.keywords,
            mentions: post.mentions,
            hashtags: post.hashtags,
            embeddingText: post.embeddingText,
        }
    })
    return postProcessPosts(enrichedPosts)
}

export async function getEnrichedPosts(ids: string[], viewer?: User) {
    return await enrichPostSet(
        removeUndefinedMapValues(
            await cachedPosts.read(ids)
        ),
        viewer
    )
}

export function postArrayToMap<T extends { id: string }>(posts: T[]): Map<string, T> {
    return new Map(posts.map(post => [post.id, post]))
}

export async function enrichPostArray(posts: Post[], viewer?: User) {
    return await enrichPostSet(new Map(posts.map(post => [post.id, post])), viewer)
}

export async function enrichPost(post: Post, viewer?: User) {
    return (await enrichPostArray([post], viewer))[0]
}
