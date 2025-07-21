import { Job, Queue, Worker } from 'bullmq';
import { updateLikeCount } from '../db/controllers/posts/engagement/like/count';
import { ConnectionOptions } from "bullmq";
import { env } from 'process';
import { updateReplyCount } from '../db/controllers/posts/count';
import { updateViewCounts } from '../db/controllers/posts/engagement/views/count';
import { updateClickCount } from '../db/controllers/posts/engagement/clicks/count';
import { updateFollowerCount, updateFollowingCount } from '../db/controllers/users/follow/count';
import { defaultDelay } from './common';
import { updateUserEngagementHistory } from '../db/controllers/engagementHistory/update';

/** Redis client config for job queue. */
const redisJobs: ConnectionOptions = {
    url: env.REDIS_URL,
    db: 1
}

/** Job queue shared by updates those require a single id. */
export const updateQueue = new Queue('updateQueue', {
    connection: redisJobs,
});

export const updateWorker = new Worker(
    'updateQueue',
    processUpdateJob,
    {
        connection: redisJobs,
        concurrency: 10
    }
);

updateWorker.on('active', job => {
    console.log(`Job ${job.id} started`);
});

updateWorker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
});

updateWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

updateWorker.on('error', err => {
    console.error('Worker error:', err);
});

async function processUpdateJob(job: Job): Promise<void> {
    console.log(`Processing update job. Type: ${job.name} Data: ${job.data} Id: ${job.id}`)
    switch (job.name as StandardJobName | RelationalJobName) {
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

function jobCategory<TData, TName extends string>() {
    async function addJob(category: TName, data: TData, delay: number = defaultDelay) {
        return await updateQueue.add(
            category,
            data,
            {
                jobId: `${category}/${data}`,
                delay,
                removeOnComplete: true,
                removeOnFail: true
            }
        );
    }

    async function addJobs(jobs: { category: TName, data: TData, delay?: number }[]) {
        return await updateQueue.addBulk(
            jobs.map(job => ({
                name: job.category,
                data: job.data,
                opts: {
                    jobId: `${job.category}/${job.data}`,
                    delay: job.delay,
                    removeOnComplete: true,
                    removeOnFail: true
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
type RelationalJobName = ""
export const relationalJobs = jobCategory<RelationalData, RelationalJobName>()

console.log("The worker started")