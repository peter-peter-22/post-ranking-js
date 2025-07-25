import { ConnectionOptions, Job, JobsOptions, Queue, Worker } from 'bullmq';
import { env } from 'process';
import { updateUserEngagementHistory } from '../../db/controllers/engagementHistory/update';
import { updateReplyCount } from '../../db/controllers/posts/engagement/reply/count';
import { updateClickCount } from '../../db/controllers/posts/engagement/clicks/count';
import { updateLikeCount } from '../../db/controllers/posts/engagement/like/count';
import { updateViewCounts } from '../../db/controllers/posts/engagement/views/count';
import { updateFollowerCount, updateFollowingCount } from '../../db/controllers/users/follow/count';

/** Redis client config for job queue. */
const redisJobsConnection: ConnectionOptions = {
    url: env.REDIS_URL,
    db: 1
}

/** Job queue shared by updates those require a single id. */
export const queue = new Queue('updateQueue', {
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
    'updateQueue',
    processUpdateJob,
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

async function processUpdateJob(job: Job): Promise<void> {
    console.log(`Processing update job. Type: ${job.name} Data: ${job.data} Id: ${job.id}`)
    switch (job.name as StandardJobName) {
        case "likeCount":
            await standardJobs.processJob(job.data, updateLikeCount)
            break;
        case "replyCount":
            await standardJobs.processJob(job.data, updateReplyCount)
            break;
        case "viewCount":
            await standardJobs.processJob(job.data, updateViewCounts)
            break;
        case "clickCount":
            await standardJobs.processJob(job.data, updateClickCount)
            break;
        case "followerCount":
            await standardJobs.processJob(job.data, updateFollowerCount)
            break;
        case "followingCount":
            await standardJobs.processJob(job.data, updateFollowingCount)
            break;
        case "userEngagementHistory":
            await standardJobs.processJob(job.data, updateUserEngagementHistory)
            break;
        default:
            throw new Error(`Invalid update job type ${job.name}`)
    }
}

export type JobData<TName, TData> = { category: TName, data: TData, delay?: number, key?: string }

function jobCategory<TData, TName extends string>() {
    async function addJob(job: JobData<TName, TData>, options?: JobsOptions) {
        return await addJobs([job], options)
    }

    async function addJobs(jobs: JobData<TName, TData>[], options?: JobsOptions) {
        return await queue.addBulk(
            jobs.map(job => ({
                name: job.category,
                data: job.data,
                opts: {
                    jobId: job.key ? `${job.category}/${job.key}` : undefined,
                    delay: job.delay,
                    ...options
                }
            }))
        );
    }

    async function processJob(data: TData, processFn: (data: TData) => Promise<void>) {
        await processFn(data)
    }

    return { addJob, addJobs, processJob }
}

export type RelationalData = {
    from: string,
    to: string,
}

type StandardJobName = "likeCount" | "followerCount" | "followingCount" | "replyCount" | "clickCount" | "viewCount" | "userEngagementHistory"
export const standardJobs = jobCategory<string, StandardJobName>()

console.log("The worker started")