import { faker } from "@faker-js/faker";
import { eq, not } from "drizzle-orm";
import { db } from "../..";
import { createPosts, createReplies } from "../../../userActions/posts/createPost";
import { clearMainUser } from "../../reset/clearMainUser";
import { follows } from "../../schema/follows";
import { users } from "../../schema/users";

//** A post appears with all kinds of replies to test the reply ranker. */
export async function testCommentRanker() {
    const mainUser = await clearMainUser()
    const [followedUser,publisher,otherUser] = await db.select({id:users.id}).from(users).where(not(eq(users.id, mainUser.id))).limit(3)
    await db.insert(follows).values([{ followerId: mainUser.id, followedId: followedUser.id }])
    const [post] = await createPosts([{ userId: publisher.id, text: "Comment ranking test" }])
    const publisherReplies = createRandomReplies(post.id, 5, "Publisher", [publisher.id])
    const followedReplies = createRandomReplies(post.id, 20, "Followed", [followedUser.id])
    const otherReplies = createRandomReplies(post.id, 100, "Other", [otherUser.id])
    await createReplies([...publisherReplies,...followedReplies,...otherReplies])
    console.log("Main user id:", mainUser.id)
    console.log("Followed user id:", followedUser.id)
    console.log("Publisher user id:", publisher.id)
    return post.id
}

function createRandomReplies(postId: string, count: number, text: string, userPool: string[]) {
    return Array.from({ length: count }).map(() => ({
        text,
        replyingTo: postId,
        userId: userPool[Math.floor(Math.random() * userPool.length)],
        likeCount: Math.round(Math.random() * 100),
        replyCount: Math.round(Math.random() * 20),
        clickCount: Math.round(Math.random() * 50),
        viewCount: Math.round(Math.random() * 200),
        createdAt: faker.date.recent({ days: 5 })
    }))
}
