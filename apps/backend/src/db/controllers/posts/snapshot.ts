import { eq } from "drizzle-orm";
import { db } from "../..";
import { PostSnapshot, postSnapshots } from "../../schema/postSnapshots";

export type PostSnapshotJobData = Omit<PostSnapshot, "createdAt">

/** The minimum difference between any engagement count between the snapshots. */
const minChange = 0.15

export async function createPostSnapshot(data: PostSnapshotJobData) {

    // Check if the difference between the new and old snapshot is big enough
    const [previousSnapshot] = await db.select().from(postSnapshots).where(eq(postSnapshots.postId, data.postId))
    if (previousSnapshot) {
        const noDifference = (
            data.likeCount / previousSnapshot.likeCount < minChange &&
            data.replyCount / previousSnapshot.replyCount < minChange &&
            data.clickCount / previousSnapshot.clickCount < minChange
        )
        if (noDifference) return
    }

    await db
        .insert(postSnapshots)
        .values(data)
}