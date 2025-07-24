import { PersonalUser } from "../../db/controllers/users/getUser";
import { cachedFollowStatus } from "./follows";
import { cachedUsers } from "./read";

export async function enrichUsers(ids: string[], viewerId?: string) {
    // Get
    const [users, follows] = await Promise.all([
        cachedUsers.read(ids),
        viewerId ? cachedFollowStatus(viewerId, ids) : undefined
    ])
    // Aggregate
    const results: Map<string, PersonalUser> = new Map()
    for (const user of users.values()) {
        if (user === undefined) continue
        results.set(user.id,{
            ...user,
            followed: follows?.has(user.id) || false,
        })
    }
    return results
}