import { recalculateUserEngagementHistory } from "../../../db/controllers/engagementHistory/update";
import { longDelay } from "../common";
import { standardJob } from "../standardJob";

export const engagementHistoryJobs = standardJob({
    name: "engagementHistory",
    handler: recalculateUserEngagementHistory,
    defaultOptions: { delay: longDelay }
})