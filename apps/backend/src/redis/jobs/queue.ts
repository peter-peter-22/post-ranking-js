import { ConnectionOptions, Job, JobsOptions, Queue, Worker } from 'bullmq';
import { env } from 'process';
import { expireJobs } from './categories/expire';

/** Redis client config for job queue. */
const redisJobsConnection: ConnectionOptions = {
    url: env.REDIS_URL,
    db: 1
}

/** Job queue shared by updates those require a single id. */
export const jobQueue = new Queue('main', {
    connection: redisJobsConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: true,
    }
});

export const worker = new Worker(
    'main',
    processJob,
    {
        connection: redisJobsConnection,
        concurrency: 10,
    }
);

worker.on('active', job => {
    console.log(`Job ${job.id} started`);
});

worker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', err => {
    console.error('Worker error:', err);
});

const jobCategories: Map<string, (data: any) => Promise<void>> = new Map()

async function processJob(job: Job): Promise<void> {
    console.log(`Processing update job. Type: ${job.name} Data: ${job.data} Id: ${job.id}`)
    const handler = jobCategories.get(job.name)
    if (!handler) throw new Error(`No handler for job ${job.name}`)
    await handler(job.data)
}

export type JobToAdd = { name: string, data: any, opts: JobsOptions }

export type JobCategoryData<TData> = { data: TData, delay?: number, options?: JobsOptions, key?: string }

export type JobCategoryOptions<TData> = {
    name: string,
    handler: (data: TData) => Promise<void>,
    serializeData: (data: TData) => string,
    deserializeData: (data: string) => TData,
    defaultOptions?: JobsOptions,
}

export function jobCategory<TData>({
    name,
    handler,
    serializeData,
    deserializeData,
    defaultOptions,
}: JobCategoryOptions<TData>) {

    async function addJob(job: JobCategoryData<TData>) {
        await addJobs([job])
    }

    async function addJobs(jobs: JobCategoryData<TData>[]) {
        await jobQueue.addBulk(
            returnJobs(jobs)
        );
    }

    function returnJob(job: JobCategoryData<TData>) {
        return returnJobs([job])[0]
    }

    function returnJobs(jobs: JobCategoryData<TData>[]) {
        return jobs.map(job => ({
            name: name,
            data: serializeData(job.data),
            opts: {
                jobId: job.key ? `${name}:${job.key}` : undefined,
                delay: job.delay,
                ...defaultOptions,
                ...job.options
            }
        }))
    }

    async function processJob(data: string) {
        await handler(deserializeData(data))
    }

    jobCategories.set(name, processJob)

    return { addJob, addJobs, returnJob, returnJobs }
}

console.log("The worker started")

// Start the repeating jobs
await expireJobs.addJob({ data: undefined, key: "" })