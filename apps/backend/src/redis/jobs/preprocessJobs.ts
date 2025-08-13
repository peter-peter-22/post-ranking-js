import { jobCategory, JobCategoryData, JobCategoryOptions } from "./queue"

export function preprocessedJob<TData>(options: JobCategoryOptions<TData>, preprocess: (job: JobCategoryData<TData>) => JobCategoryData<TData>) {
    const { addJob, addJobs, returnJob, returnJobs, ...methods } = jobCategory<TData>(options)

    return {
        addJob: (job: JobCategoryData<TData>) => addJob(preprocess(job)),
        addJobs: (job: JobCategoryData<TData>[]) => addJobs(job.map(preprocess)),
        returnJob: (job: JobCategoryData<TData>) => returnJob(preprocess(job)),
        returnJobs: (job: JobCategoryData<TData>[]) => returnJobs(job.map(preprocess)),
        ...methods
    }
}