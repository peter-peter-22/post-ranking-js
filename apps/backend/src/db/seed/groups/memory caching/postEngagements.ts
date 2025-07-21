import { Engagement } from "../../../../bots/getEngagements";
import { Post } from "../../../schema/posts";

export type EngagementCounter = {
    likes: number,
    replies: number,
    clicks: number,
    views: number,
}

/** Post id and engagement counts. */
export type PostEngagementCounts=[
    id:string,
    counts:EngagementCounter
]   

/**
 * Cache the engagement counts for the posts in the memory and return functions to read and update the cache.
 * @return Functions to add and get engagement counts.
 */
export function getEngagementCache() {
    console.log("Creating engagement count cache...")

    // Create an empty map for the engagement counters.
    const engagementMap = new Map<string, EngagementCounter>();

    // Add engagements and update the counters.
    const add = (engagements: Engagement[]) => {
        console.log("Updating cached engagement counts...")
        for (const engagement of engagements) {
            // Get or create the counter for the post
            let counter = engagementMap.get(engagement.post.id)
            if (!counter) {
                counter = { likes: 0, clicks: 0, replies: 0, views: 0 }
                engagementMap.set(engagement.post.id, counter)
            }
            // Increase the counters
            if (engagement.like) counter.likes++
            if (engagement.reply) counter.replies++
            if (engagement.click) counter.clicks++
            counter.views++
        }
        console.log("Updated cached engagement counts.")
    }

    // Get the engagement count for a post.
    const get = (postId: string): EngagementCounter | undefined => {
        return engagementMap.get(postId)
    }

    /** Use the engagement counts in the memory to overwrite a post. */
    const applyCounts = (post: Post) => {
        // Get the existing engagement counts for the post.
        const counter = get(post.id);
        // If no prior engagement, exit.
        if (!counter) return
        // Apply the engagement counts to the post.
        post.likeCount = counter.likes;
        post.replyCount = counter.replies;
        post.clickCount = counter.clicks;
        post.viewCount = counter.views;
    }

    /** Get all engagement counters */
    const getAll = ():PostEngagementCounts[] => {
        return Array.from(engagementMap.entries());
    }

    return { add, get, applyCounts, getAll}
}