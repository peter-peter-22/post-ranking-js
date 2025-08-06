import { standardDelay } from "../common";
import { standardJob } from "../standardJob";

export const engagementHistorySnapshotJobs = standardJob({
    name: "engagementHistorySnapshot",
    handler: async () => { },//TODO this is not supposed to be here
    defaultOptions: { delay: standardDelay }
})