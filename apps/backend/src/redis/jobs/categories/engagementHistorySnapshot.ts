import { recalculateUserEngagementHistory } from "../../../db/controllers/engagementHistory/update";
import { standardDelay } from "../common";
import { standardJob } from "../standardJob";

export const engagementHistorySnapshotJobs = standardJob({
    name: "engagementHistorySnapshot",
    handler: recalculateUserEngagementHistory,
    defaultOptions: { delay: standardDelay }
})