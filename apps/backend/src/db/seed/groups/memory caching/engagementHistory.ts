import { Engagement } from "../../../../bots/getEngagements";
import { EngagementHistory } from "../../../schema/engagementHistory";

/**
 * Track the engagement history between users and export functions to get and update them.
 * @returns Functions to get and update engagement history.
 */
export function getEngagementHistoryCache() {
    console.log("Creating engagement history reader...")
    // Create empty map.
    const historyMap = new Map<string, Map<string, EngagementHistory>>();

    // Get engagement history between users.
    const get = (viewerId: string, publisherId: string): EngagementHistory | undefined => {
        // Check if the viewerId exists in the map
        const historiesOfViewer = historyMap.get(viewerId);
        if (historiesOfViewer) {
            // Check if the publisherId exists in the nested map
            return historiesOfViewer.get(publisherId);
        }
    }

    /** Set the engagement history between a user and a publisher.
     * @param viewerId The id of the viewer.
     * @param publisherId The id of the publisher.
     * @param history The engagement history to set.
     * @return The new engagement history.
     */
    const set = (viewerId: string, publisherId: string, history: EngagementHistory) => {
        // Get or create viewer.
        let viewerHistories = historyMap.get(viewerId)
        if (!viewerHistories) {
            viewerHistories = new Map<string, EngagementHistory>();
            historyMap.set(viewerId, viewerHistories);
        }
        // Update personal history of publisher.
        viewerHistories.set(publisherId, history);
        return history;
    }

    /** Get an engagement history, create if doesn't exists
     * @param viewerId The id of the viewer.
     * @param publisherId The id of the publisher.
     * @return The engagement history.
     */
    const getOrCreate = (viewerId: string, publisherId: string): EngagementHistory => {
        // Try to get the history
        let myHistory = get(viewerId, publisherId)
        if (myHistory) return myHistory
        // If doesn't exists, create it
        myHistory = set(viewerId, publisherId, { likes: 0, replies: 0, clicks: 0, viewerId, publisherId });
        return myHistory
    }

    /** Apply the provided engagements to the cached engagement histories.
     * @param engagements The engagements to apply.
     */
    const apply = (engagements: Engagement[]) => {
        console.log("Applying engagements to the cached histories.")
        for (let engagement of engagements) {
            // Get or create the history between the viewer and the poster.
            const history = getOrCreate(engagement.user.id, engagement.post.userId)
            // Update the history.
            if (engagement.like) history.likes++
            if (engagement.reply) history.replies++
            if (engagement.click) history.clicks++
        }
        console.log("Cached engagement histories updated.")
    }

    /** Get all engagement histories.
     * @return An array of engagement histories.
     */
    const getAll = (): EngagementHistory[] => (
        Array.from(historyMap.values()).flatMap((viewerHistories)=>(
            Array.from(viewerHistories.values())
        ))
    )

    // Return the functions.
    return { get, apply, getAll }
}