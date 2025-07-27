import { updateViewCounts } from "../../../db/controllers/posts/engagement/views/count";
import { defaultDelay } from "../common";
import { standardJob } from "../standardJob";

export const viewsCountJobs = standardJob({
    name: "viewCount",
    handler: updateViewCounts,
    defaultOptions: { delay: defaultDelay }
})