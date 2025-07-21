import { db } from ".."
import { follow } from "../../userActions/follow"
import { User, UserCommon, users } from "../schema/users"
import { topics } from "../../bots/examplePosts"

/** Creates the secondary user who is followed by the main user.
 * @param mainUser The main user.
 * @returns The followed user.
 */
export async function createFollowedUser(mainUser:UserCommon) {
    //make the main user follow this user
    const [followedUser] = await db.insert(users)
        .values({
            handle: "followed-user",
            name: "Followed User",
            bot: true,
            interests: [topics[0]]
        })
        .returning()

    //make the main user follow this user
    await follow(mainUser.id, followedUser.id)

    return followedUser
}