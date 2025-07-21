import { db } from "../../..";
import { follows } from "../../../schema/follows";

/** Get a nested map of follow relationships. */
async function getFollowMap() {
    // Get the follows from the db
    const allFollows = await db.select().from(follows);

    // Build the nested map
    const followMap = new Map<string, Set<string>>();
    allFollows.forEach(follow => {
        if (!followMap.has(follow.followerId)) {
            followMap.set(follow.followerId, new Set<string>());
        }
        followMap.get(follow.followerId)?.add(follow.followedId);
    });

    return followMap
}

/**
 * Fetch the follow relationships for all users and create a function that checks if a user follows another user.
 if a user follows another user.
 * @returns A function that checks if a user follows another user.
 */
export async function getFollowChecker() {
    console.log("Creating follow checker...")
    const followMap = await getFollowMap()
    return (followerId: string, followedId: string):boolean => {
        // Check if the followerId exists in the map
        const followedSet = followMap.get(followerId);
        if (followedSet) {
            // Check if the followedId exists in the set
            return followedSet.has(followedId);
        }
        return false; // FollowerId doesn't exist in the map
    }
}