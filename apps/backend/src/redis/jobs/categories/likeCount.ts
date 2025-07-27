import { updateLikeCount } from "../../../db/controllers/posts/engagement/like/count";
import { defaultDelay } from "../common";
import { standardJob } from "../standardJob";

export const likeCountJobs = standardJob({
    name: "likeCount",
    handler: updateLikeCount,
    defaultOptions: { delay: defaultDelay }
})