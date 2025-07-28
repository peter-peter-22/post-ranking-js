import { recalculateUserEmbeddingVector } from "../../../db/controllers/embedding/updateUserEmbedding";
import { longDelay } from "../common";
import { standardJob } from "../standardJob";

export const userEmbeddingJobs = standardJob({
    name: "userEmbedding",
    handler: recalculateUserEmbeddingVector,
    defaultOptions: { delay: longDelay }
})