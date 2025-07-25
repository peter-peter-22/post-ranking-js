import { longDelay } from "./common";
import { standardJobs } from "./queue";

export async function scheduleEngagementHistoryUpdate(userId: string) {
    await Promise.all([
        standardJobs.addJob({category:"userEngagementHistory",data:userId,delay:longDelay})
    ])
}