import { eq } from "drizzle-orm";
import { db } from "../..";
import { engagementHistory } from "../../schema/engagementHistory";
import { engagementHistorySnapshots } from "../../schema/engagementHistorySnapshots";

export async function createEngagementHistorySnapshots(userId: string) {
    await db
        .insert(engagementHistorySnapshots)
        .select(
            db
                .select()
                .from(engagementHistory)
                .where(eq(engagementHistory.viewerId, userId))
        )
}