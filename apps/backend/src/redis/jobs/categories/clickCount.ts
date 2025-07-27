import { updateClickCount } from "../../../db/controllers/posts/engagement/clicks/count";
import { defaultDelay } from "../common";
import { standardJob } from "../standardJob";

export const clickCountJobs = standardJob({
    name: "clickCount",
    handler: updateClickCount,
    defaultOptions: { delay: defaultDelay }
})