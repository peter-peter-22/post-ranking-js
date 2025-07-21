import { Engagement } from "../../../../bots/getEngagements";

/** Get a map of what users replied to what posts. */
function getCommenterMap() {
    const replyMap = new Map<string, Set<string>>();
    return replyMap
}

/**
 * Track who replied to what post.
 * @returns A function that returns the users who replied to the post.
 */
export function getCommenterChecker() {
    console.log("Creating commenter checker...")

    // Create the map
    const commenterMap = getCommenterMap()

    /** Get the users who replied to a post. 
     * @param postId The id of the post examined post.
     * @return The users who replied to the post, or undefined if it does not exist in the map.
    */
    const get = (postId: string): Set<string> | undefined => {
        return commenterMap.get(postId);
    }

    /** Get or create the commenter set.
     * @param postId The id of the post examined post.
     * @return The users who replied to the post.
     */
    const getOrCreate = (postId: string) => {
        // Try to get
        let commenters = get(postId)
        if (commenters) return commenters
        // If doesn't exists, create
        commenters = new Set()
        commenterMap.set(postId, commenters)
        return commenters;
    }

    /** Update the commenter map based on the engagements.
     * @param engagements The engagements to update the commenter map with.
     */
    const update = (engagements: Engagement[]) => {
        console.log("Updating cached commenters...")
        for (const engagement of engagements) {
            // The the commenter set of the affected post.
            const commenters = getOrCreate(engagement.post.id);
            // If the engagement contains a reply, add the user to the set.
            if (engagement.reply) commenters.add(engagement.user.id)
        }
        console.log("Updated cached commenters.")
    }

    // Return the functions
    return { update, get }
}