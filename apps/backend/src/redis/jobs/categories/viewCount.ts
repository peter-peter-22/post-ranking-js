import { updateViewCounts } from "../../../db/controllers/posts/engagement/views/count";
import { standardDelay } from "../common";
import { standardJob } from "../standardJob";

export const viewCountJobs = standardJob({
    name: "viewCount",
    handler: updateViewCounts,
    defaultOptions: { delay: standardDelay }
})