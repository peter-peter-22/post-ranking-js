import { eq } from "drizzle-orm"
import { db } from "../.."
import { follows } from "../../schema/follows"
import { likes } from "../../schema/likes"
import { notifications } from "../../schema/notifications"
import { posts } from "../../schema/posts"
import { likePost } from "../../../userActions/posts/like"
import { follow } from "../../../userActions/follow"
import { createReplies } from "../../../userActions/posts/createPost"
import { createMentionNotifications, createReplyNotification } from "../../controllers/notifications/createNotification"
import { UserCommon, users } from "../../schema/users"

export async function notificationTest(viewer: UserCommon) {
    const [post] = await db.select().from(posts).where(eq(posts.userId, viewer.id)).limit(1)
    await db.delete(notifications)
    await db.delete(posts).where(eq(posts.replyingTo, post.id))
    await db.delete(likes).where(eq(likes.postId, post.id))
    await db.delete(follows).where(eq(follows.followedId, viewer.id))
    const actors = await db.select().from(users).limit(10)
    for (const user of actors) {
        await likePost(post.id, user.id, true)
        await follow(user.id, viewer.id)
    }
    const replies = await createReplies(actors.map(user => ({
        userId: user.id,
        text: "reply text @main_user",
        replyingTo: post.id
    })))
    for (const reply of replies) {
        if (reply.repliedUser && reply.replyingTo)
            await createReplyNotification(reply.repliedUser, reply.replyingTo, reply.createdAt)
        await createMentionNotifications(reply.mentions, reply.id, reply.createdAt)
    }
}