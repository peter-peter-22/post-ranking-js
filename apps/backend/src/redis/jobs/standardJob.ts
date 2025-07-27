import { standardDelay } from "./common";
import { jobCategory, JobCategoryData, JobCategoryOptions } from "./queue";

/** Job where the data is a single string value. */
export function standardJob(options: Omit<JobCategoryOptions<string>, "deserializeData" | "serializeData">) {
    const { addJob, addJobs, returnJob, returnJobs, ...methods } = jobCategory<string>({
        serializeData: data => data,
        deserializeData: data => data,
        ...options
    })

    const preprocess = (data: JobCategoryData<string>): JobCategoryData<string> => ({
        key: data.data,
        ...data,
    })

    return {
        addJob: (data: JobCategoryData<string>) => addJob(preprocess(data)),
        addJobs: (data: JobCategoryData<string>[]) => addJobs(data.map(preprocess)),
        returnJob: (data: JobCategoryData<string>) => returnJob(preprocess(data)),
        returnJobs: (data: JobCategoryData<string>[]) => returnJobs(data.map(preprocess)),
        ...methods
    }
}