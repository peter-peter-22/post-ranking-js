import { jobCategory, JobCategoryData, JobCategoryOptions } from "./queue"

export function preprocessedJob<TData>(options: JobCategoryOptions<TData>, preprocess: (data: JobCategoryData<TData>) => JobCategoryData<TData>) {
    const { addJob, addJobs, returnJob, returnJobs, ...methods } = jobCategory<TData>(options)

    return {
        addJob: (data: JobCategoryData<TData>) => addJob(preprocess(data)),
        addJobs: (data: JobCategoryData<TData>[]) => addJobs(data.map(preprocess)),
        returnJob: (data: JobCategoryData<TData>) => returnJob(preprocess(data)),
        returnJobs: (data: JobCategoryData<TData>[]) => returnJobs(data.map(preprocess)),
        ...methods
    }
}