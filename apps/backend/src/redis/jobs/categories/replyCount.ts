import { updateReplyCount } from "../../../db/controllers/posts/engagement/reply/count";
import { defaultDelay } from "../common";
import { standardJob } from "../standardJob";

export const replyCountJobs = standardJob({
    name: "replyCount",
    handler: updateReplyCount,
    defaultOptions: { delay: defaultDelay }
})