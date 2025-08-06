import { longDelay } from "../common";
import { standardJob } from "../standardJob";

export const engagementHistoryJobs = standardJob({
    name: "engagementHistory",
    handler: async ()=>{}, //TODO replace with new method
    defaultOptions: { delay: longDelay }
})