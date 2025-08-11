import { jobCategory, JobCategoryOptions } from "./queue";

/** Job without data. */
export const emptyJob = (options: Omit<JobCategoryOptions<void>,  "serializeData" | "deserializeData">) => jobCategory<void>({
    serializeData: () => "",
    deserializeData: () => undefined,
    ...options
})