import { userFollowerCountRedis } from "../../../jobs/followerCount";
import { userFollowingCountRedis } from "../../../jobs/followingCount";
import { redisClient } from "../../../redis/connect";
import { PersonalUser } from "./getUser";

/** Apply changes to the fetched users before sending them to the client.
 ** Add realtime data from redis 
 */
export async function postProcessUsers(users: PersonalUser[]) {
    if(users.length === 0) return users
    await applyRealtimeEngagements(users)
    return users
}

async function applyRealtimeEngagements(users: PersonalUser[]) {
    // Get the realtime data for each user
    const tx = redisClient.multi()
    for (const user of users) {
        tx.get(userFollowerCountRedis(user.id))
        tx.get(userFollowingCountRedis(user.id))
    }
    const results = await tx.exec()
    // Add the results to the users
    for (let i = 0; i < users.length; i++) {
        const redisIndex = i * 2
        const followers = results[redisIndex]
        const following = results[redisIndex + 1]
        const user = users[i]
        if (followers) user.followerCount = parseInt(followers.toString())
        if (following) user.followingCount = parseInt(following.toString())
    }
}