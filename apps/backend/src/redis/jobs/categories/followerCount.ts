import { recalculateFollowerCount } from "../../../db/controllers/users/follow/count";
import { standardDelay } from "../common";
import { standardJob } from "../standardJob";

export const followerCountJobs = standardJob({
    name: "followerCount",
    handler: recalculateFollowerCount,
    defaultOptions: { delay: standardDelay }
})