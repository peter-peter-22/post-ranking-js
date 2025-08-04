import { PersonalUser } from "../../db/controllers/users/getUser";
import { cachedFollowStatus } from "./follows";
import { cachedUsers } from ".";
import { redisClient } from "../connect";

export async function getEnrichedUsers(ids: string[], viewerId?: string) {
    // Get users
    const users = await cachedUsers.read(ids)
    // Create enriched users with default data
    const enrichedUsers = new Map<string, PersonalUser | undefined>(
        [...users.entries()].map(
            ([key, user]) => [key, user && { ...user, followed: false }]
        )
    )
    // Get metadata
    if (viewerId) {
        const multi = redisClient.multi()
        // Followed status
        cachedFollowStatus(viewerId, ids, multi)
        // Fetch results
        const results = await multi.exec()
        const follows = results[0] as number[]
        // Aggregate
        for (let i = 0; i < ids.length; i++) {
            const userId = ids[i]
            const followed = Boolean(follows[i])
            const user = enrichedUsers.get(userId)
            if (!user) continue
            user.followed=followed
        }
    }
    return enrichedUsers
}