import { preprocessedJob } from "./preprocessJobs";
import { JobCategoryData, JobCategoryOptions } from "./queue";

/** Job where the data is a json. */
export function jsonJob<TData extends object>(
    options: Omit<JobCategoryOptions<TData>, "deserializeData" | "serializeData">,
    preprocess: (data: JobCategoryData<TData>) => JobCategoryData<TData>
) {
    return preprocessedJob<TData>(
        {
            serializeData: data => JSON.stringify(data),
            deserializeData: data => JSON.parse(data),
            ...options
        },
        preprocess
    )
}