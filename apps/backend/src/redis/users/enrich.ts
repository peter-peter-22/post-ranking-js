import { PersonalUser } from "../../db/controllers/users/getUser";
import { cachedFollowStatus } from "./follows";
import { cachedUsers } from "./read";

export async function enrichUsers(ids: string[], viewerId?: string): Promise<PersonalUser[]> {
    // Get
    const [users, follows] = await Promise.all([
        cachedUsers.read(ids),
        viewerId ? cachedFollowStatus(viewerId, ids) : undefined
    ])
    // Aggregate
    const results: PersonalUser[] = []
    for (const user of users.values()) {
        if (user === null) continue
        results.push({
            ...user,
            followed: follows?.has(user.id) || false,
        })
    }
    return results
}