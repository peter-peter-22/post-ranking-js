import { PostSnapshotJobData } from "../../../db/controllers/posts/snapshot";
import { preprocessedJob } from "../preprocessJobs";
import { JobCategoryData, JobCategoryOptions } from "../queue";

/** Job where the data is a single string value and the key is the data. */
export function standardJob(options: Omit<JobCategoryOptions<PostSnapshotJobData>, "deserializeData" | "serializeData">) {
    return preprocessedJob<PostSnapshotJobData>(
        {
            serializeData: data => JSON.stringify(data),
            deserializeData: data => JSON.parse(data),
            ...options
        },
        (data: JobCategoryData<PostSnapshotJobData>) => {
            data.key = data.data.postId
            return data
        }
    )
}