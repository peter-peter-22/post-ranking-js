import { db } from "../.."
import { Engagement } from "../../../bots/getEngagements"
import { createReplies } from "../../../userActions/posts/createPost"
import { chunkedInsert } from "../../utils/chunkedInsert"
import { clicks, ClicksToInsert } from "../../schema/clicks"
import { likes, LikeToInsert } from "../../schema/likes"
import { views, ViewToInsert } from "../../schema/views"
import { generateReplyText, getRandomTopicFromUser } from "../../seed/posts"
import { PostToCreate } from "../../../routes/userActions/posts/createPost"

/** Format the engagement data and insert it into the DB. */
export async function insertEngagements(engagements: Engagement[]) {
    console.log("Inserting engagements...")
    await Promise.all([
        insertLikes(engagements),
        insertReplies(engagements),
        insertClicks(engagements),
        insertViews(engagements)
    ])
    console.log("Inserted engagements")
}

/** Format and insert likes. */
async function insertLikes(engagements: Engagement[]) {
    const likesToInsert: LikeToInsert[] = engagements
        .filter(engagement => engagement.like)
        .map(engagement => ({
            postId: engagement.post.id,
            userId: engagement.user.id,
            createdAt: engagement.date
        }))
    if (likesToInsert.length === 0) return
    await chunkedInsert(
        likesToInsert,
        async (rows) => { await db.insert(likes).values(rows) }
    )}

/** Format and insert likes. */
async function insertReplies(engagements: Engagement[]) {
    const replies: PostToCreate[] = engagements
        .filter(engagement => engagement.reply)
        .map(engagement => ({
            replyingTo: engagement.post.id,
            userId: engagement.user.id,
            text: generateReplyText(getRandomTopicFromUser(engagement.user)),
            createdAt: engagement.date
        }))
    if (replies.length === 0) return
    await createReplies(replies)
}

/** Format and insert likes. */
async function insertClicks(engagements: Engagement[]) {
    const clicksToInsert: ClicksToInsert[] = engagements
        .filter(engagement => engagement.click)
        .map(engagement => ({
            postId: engagement.post.id,
            userId: engagement.user.id,
            createdAt: engagement.date
        }))
    if (clicksToInsert.length === 0) return
    await chunkedInsert(
        clicksToInsert,
        async (rows) => { await db.insert(clicks).values(rows) }
    )
}

/** Format and insert views. */
async function insertViews(engagements: Engagement[]) {
    // All engagement entries cause views.
    const viewsToInsert: ViewToInsert[] = engagements
        .map(engagement => ({
            postId: engagement.post.id,
            userId: engagement.user.id,
            createdAt: engagement.date
        }))
    if (viewsToInsert.length === 0) return
    await chunkedInsert(
        viewsToInsert,
        async (rows) => { await db.insert(views).values(rows) }
    )
}