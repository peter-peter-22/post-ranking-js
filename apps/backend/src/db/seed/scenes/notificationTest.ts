import { eq } from "drizzle-orm"
import { db } from "../.."
import { userActions } from "../../../userActions/main"
import { insertPost } from "../../../userActions/posts/createPost"
import { follows } from "../../schema/follows"
import { likes } from "../../schema/likes"
import { notifications } from "../../schema/notifications"
import { posts } from "../../schema/posts"
import { UserClient, users } from "../../schema/users"

export async function notificationTest(viewer: UserClient) {
    const post = await insertPost({ userId: viewer.id, text: "notification test" })
    await db.delete(notifications)
    await db.delete(posts).where(eq(posts.replyingTo, post.id))
    await db.delete(likes).where(eq(likes.postId, post.id))
    await db.delete(follows).where(eq(follows.followedId, viewer.id))
    const actors = await db.select().from(users).limit(10)
    for (const user of actors) {
        await userActions.posts.engagements.actions.likes.add(viewer.id, [post.id])
        await userActions.users.follow(user.id, viewer.id, true)
    }
    await Promise.all(
        actors
            .map(user => ({
                userId: user.id,
                text: "reply text @main_user",
                replyingTo: post.id
            }))
            .map(reply => insertPost(reply))
    )
}