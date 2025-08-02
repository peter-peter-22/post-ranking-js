import { Post } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { PersonalPost } from "../../posts/hydratePosts";
import { cosineSimilarity } from "../../utilities/arrays/cosineSimilarity";
import { removeUndefinedMapValues } from "../../utilities/arrays/removeUndefinedMapValues";
import { cachedClicks, cachedLikes, cachedViews } from "../personalEngagements/instances";
import { getFollowedReplierCounts } from "./replies";
import { cachedEngagementHistoryRead } from "../users/engagementHistory";
import { getEnrichedUsers } from "../users/enrich";
import { cachedPostRead } from ".";

export async function enrichPosts(posts: Map<string, Post>, viewer?: User) {
    // Format 
    const postIds: string[] = []
    const userIds: Set<string> = new Set()
    for (const post of posts.values()) {
        postIds.push(post.id)
        userIds.add(post.userId)
    }
    const viewerId = viewer?.id
    // Fetch
    const [users, likes, views, clicks, engagementHistories, followedReplierCounts] = await Promise.all([
        getEnrichedUsers([...userIds], viewerId),
        viewerId ? cachedLikes.get(postIds, viewerId, posts) : undefined,
        viewerId ? cachedViews.get(postIds, viewerId, posts) : undefined,
        viewerId ? cachedClicks.get(postIds, viewerId, posts) : undefined,
        viewerId ? cachedEngagementHistoryRead(viewerId, [...userIds]) : undefined,
        viewerId ? getFollowedReplierCounts(viewerId, [...posts.values()]) : undefined
    ])
    // Aggregate
    const enrichedPosts: PersonalPost[] = [...posts.values()].map((post, i) => {
        const liked = likes?.get(post.id) || false;
        const viewed = views?.get(post.id) || false;
        const clicked = clicks?.get(post.id) || false;
        const engagementHistory = engagementHistories?.get(post.userId) || null
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
            engagementHistory: engagementHistory,
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
    return enrichedPosts
}

export async function getEnrichedPosts(ids: string[], viewer?: User) {
    return await enrichPosts(
        removeUndefinedMapValues(
            await cachedPostRead(ids)
        ),
        viewer
    )
}