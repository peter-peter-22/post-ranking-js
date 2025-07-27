import { recalculateFollowerCount } from "../../../db/controllers/users/follow/count";
import { defaultDelay } from "../common";
import { standardJob } from "../standardJob";

export const followerCountJobs = standardJob({
    name: "followerCount",
    handler: recalculateFollowerCount,
    defaultOptions: { delay: defaultDelay }
})