import { preprocessedJob } from "./preprocessJobs";
import { JobCategoryData, JobCategoryOptions } from "./queue";

/** Job where the data is a single string value and the key is the data. */
export function standardJob(options: Omit<JobCategoryOptions<string>, "deserializeData" | "serializeData">) {
    return preprocessedJob<string>(
        {
            serializeData: data => data,
            deserializeData: data => data,
            ...options
        },
        (job: JobCategoryData<string>): JobCategoryData<string> => {
            job.key = job.data
            return job
        }
    )
}