import { longDelay } from "./common";
import { standardJobs } from "./updates";

export async function scheduleEngagementHistoryUpdate(userId: string) {
    await Promise.all([
        standardJobs.addJob("userEngagementHistory", userId, longDelay)
    ])
}