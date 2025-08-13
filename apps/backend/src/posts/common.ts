import { z } from "zod"
import { Post } from "../db/schema/posts"

export const BasicFeedSchema = z.object({
    offset: z.number().default(0)
})

export type SingleDatePageParams = {
    maxDate: string
}

/** Remove posts with duplicated ids. */
export function deduplicatePosts(posts: Post[]) {
    const seen = new Set<string>();
    const deduplicated = posts.filter(post => {
        if (seen.has(post.id))
            return false;
        else {
            seen.add(post.id);
            return true;
        }
    })
    return deduplicated
}