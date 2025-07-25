import { Post } from "../../db/schema/posts";
import { PersonalPost } from "../../posts/hydratePosts";
import { cachedClicks, cachedLikes, cachedViews } from "../personalEngagements/instances";
import { cachedEngagementHistoryRead } from "../users/engagementHistory";
import { enrichUsers } from "../users/enrich";

export async function enrichPosts(posts: Map<string, Post>, viewerId?: string) {
    // Format 
    const postIds: string[] = []
    const userIds: Set<string> = new Set()
    for (const post of posts.values()) {
        postIds.push(post.id)
        userIds.add(post.userId)
    }
    // Fetch
    const [users, likes, views, clicks] = await Promise.all([
        enrichUsers([...userIds], viewerId),
        viewerId ? cachedLikes.get(postIds, viewerId, posts) : undefined,
        viewerId ? cachedViews.get(postIds, viewerId, posts) : undefined,
        viewerId ? cachedClicks.get(postIds, viewerId, posts) : undefined,
        viewerId ? cachedEngagementHistoryRead(viewerId, [...userIds]) : undefined
    ])
    // Aggregate
    const enrichedPosts: PersonalPost[] = [...posts.values()].map(post => {
        const liked = likes?.get(post.id) || false;
        const viewed = views?.get(post.id) || false;
        const clicked = clicks?.get(post.id) || false
        const user = users.get(post.userId)
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
            similarity: 0,
            engagementHistory: null,
            repliedByFollowed: false,
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