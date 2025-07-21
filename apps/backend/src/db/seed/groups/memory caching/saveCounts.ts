import { eq } from "drizzle-orm";
import { db } from "../../..";
import { chunkedInsert } from "../../../utils/chunkedInsert";
import { posts } from "../../../schema/posts";
import { PostEngagementCounts } from "./postEngagements";
import { EngagementHistory, engagementHistory } from "../../../schema/engagementHistory";
import { UserEmbeddingSnapshotToInsert } from "../../../schema/userEmbeddingSnapshots";
import { users } from "../../../schema/users";

/** Apply the engagement counts from the memory to the database to avoid recalculating them unnecessarily. 
 * @param engagementCounts Array of engagement count entries to apply.
*/
export async function applyMemoryEngagementCounts(engagementCounts: PostEngagementCounts[]) {
    console.log("Saving engagement counts...")
    await chunkedInsert(
        engagementCounts,
        async (batchCounts) => {
            await db.transaction(async tx => {
                for (const [id, counts] of batchCounts) {
                    await tx
                        .update(posts)
                        .set({
                            likeCount: counts.likes,
                            replyCount: counts.replies,
                            clickCount: counts.clicks,
                            viewCount: counts.views
                        })
                        .where(eq(posts.id, id))
                }
            })
        }
    )
}

/** Apply the engagement counts from the memory to the database to avoid recalculating them unnecessaryly.
 * @param engagement_counts Array of engagement count entries to apply.
 */
export async function applyMemoryEngagementHistory(engagementHistories: EngagementHistory[]) {
    console.log("Saving engagement histories...")
    await chunkedInsert(
        engagementHistories,
        async (batchHistories) => {
            await db
                .insert(engagementHistory)
                .values(batchHistories)
                .onConflictDoNothing()
        }
    )
}

/** Apply the user embedding vectors from the memory to the database to avoid recalculating them.
 * @param user_vectors Array of user embedding vectors to apply.
 */
export async function applyMemoryUserEmbeddingVectors(userVectors: UserEmbeddingSnapshotToInsert[]) {
    console.log("Saving user embedding vectors...")
    await db.transaction(
        async (tx) => {
            userVectors.map(async (userVector) => {
                await tx
                    .update(users)
                    .set({ embedding: userVector.embedding })
                    .where(eq(users.id, userVector.userId))
            })
        }
    )
}