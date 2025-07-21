import { gte } from "drizzle-orm";
import { db } from "../..";
import { views } from "../../schema/views";
import { persistentDate } from "../persistentDates";
import { promisesAllTracked } from "../../../utilities/arrays/trackedPromises";
import { updateUserEngagementHistory } from "./update";

/** The last time the engagement history of the users were updates. */
const lastUpdate=persistentDate("engagementHistoryLastUpdate")

/** Select the users those were active since the last update and update their engagement history. */
export async function updateAllEngagementHistory() {// TODO make it faster
    console.log("Updating all engagement history...")
    const lastUpdateDate = await lastUpdate.get()
    // Select all unique users who viewed anything since the last update. 
    const usersToUpdate = await db
        .selectDistinct({ id: views.userId })
        .from(views)
        .where(gte(views.createdAt, lastUpdateDate))
        .orderBy(views.userId)
    console.log(`Found ${usersToUpdate.length} users to update`)
    // Update the engagement history of the selected users.
    await promisesAllTracked(
        usersToUpdate.map(
            user => updateUserEngagementHistory(user.id)
        )
    )
    // Update the last update date.
    await lastUpdate.set()
    console.log("Engagement history update complete.")
}