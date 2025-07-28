import { recalculateFollowingCount } from "../../../db/controllers/users/follow/count";
import { standardDelay } from "../common";
import { standardJob } from "../standardJob";

export const followingCountJobs = standardJob({
    name: "followingCount",
    handler: recalculateFollowingCount,
    defaultOptions: { delay: standardDelay }
})