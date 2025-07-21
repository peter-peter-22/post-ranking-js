import { sql } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { authRequestStrict } from "../../authentication";
import { db } from "../../db";
import { getNotificationCount } from "../../db/controllers/notifications/getCount";
import { clicks } from "../../db/schema/clicks";
import { views } from "../../db/schema/views";
import { postClickCounterRedis } from "../../jobs/clickCount";
import { defaultDelay } from "../../jobs/common";
import { scheduleEngagementHistoryUpdate } from "../../jobs/engagementHistory";
import { postReplyCounterRedis } from "../../jobs/replyCount";
import { standardJobs } from "../../jobs/updates";
import { postViewCounterRedis } from "../../jobs/viewCount";
import { redisClient } from "../../redis/connect";
import { selectTargetPosts } from "../../userActions/posts/common";
import { postLikeCounterRedis } from "../../userActions/posts/like";

const router = Router();

const RegularUpdateSchema = z.object({
    viewedPosts: z.string().array(),
    clickedPosts: z.string().array(),
    visiblePosts: z.string().array()
})

router.post('/', async (req, res) => {
    const user = await authRequestStrict(req)
    const { viewedPosts, clickedPosts, visiblePosts } = RegularUpdateSchema.parse(req.body);
    const [engagementCounts,notificationCount] = await Promise.all([
        handleVisiblePosts(visiblePosts),
        getNotificationCount(user.id),
        handleViews(user.id, viewedPosts),
        handleClicks(user.id, clickedPosts)
    ])
    res.json({
        engagementCounts,
        notificationCount 
    })
})

type RealtimeEngagements = {
    postId: string,
    likes?: number,
    clicks?: number,
    views?: number,
    replies?: number
}

async function handleVisiblePosts(visiblePosts: string[]) {
    if (visiblePosts.length === 0) return
    // Get the engagement counts of each post
    const tx = redisClient.multi()
    for (const postId of visiblePosts) {
        tx.get(postLikeCounterRedis(postId))
        tx.get(postClickCounterRedis(postId))
        tx.get(postReplyCounterRedis(postId))
        tx.get(postViewCounterRedis(postId))
    }
    const results = await tx.exec()
    // Format the results
    const parsed: RealtimeEngagements[] = []
    for (let i = 0; i < visiblePosts.length; i++) {
        const redisIndex = i * 4
        const likes = results[redisIndex]
        const clicks = results[redisIndex + 1]
        const replies = results[redisIndex + 2]
        const views = results[redisIndex + 3]
        const engagements: RealtimeEngagements = { postId: visiblePosts[i] }
        if (likes) engagements.likes = parseInt(likes.toString())
        if (clicks) engagements.clicks = parseInt(clicks.toString())
        if (replies) engagements.replies = parseInt(replies.toString())
        if (views) engagements.views = parseInt(views.toString())
        parsed.push(engagements)
    }
    return parsed
}

async function handleViews(userId: string, viewedPosts: string[]) {
    if (viewedPosts.length === 0) return
    // Create views in the database
    const targetPosts = selectTargetPosts(viewedPosts)
    const createdViews = await db
        .insert(views)
        .select(db
            .select({
                postId: targetPosts.id,
                userId: sql`${userId}`.as("user_id"),
                posterId: targetPosts.userId,
                createdAt: sql`now()`.as("created_at"),
            })
            .from(targetPosts)
        )
        .onConflictDoNothing()
        .returning()
    // Increase the counters in redis
    const tx = redisClient.multi()
    createdViews.forEach(view => {
        tx.incr(postViewCounterRedis(view.postId))
    });
    // Create jobs to update the view counts in the database
    const jobsPromise = standardJobs.addJobs(createdViews.map(view => ({
        category: "viewCount",
        data: view.postId,
        delay: defaultDelay
    })))
    // Execute the promises
    await Promise.all([jobsPromise, tx.exec()])
}

async function handleClicks(userId: string, clickedPosts: string[]) {
    if (clickedPosts.length === 0) return
    // Create clicks in the database
    const targetPosts = selectTargetPosts(clickedPosts)
    const createdClicks = await db
        .insert(clicks)
        .select(db
            .select({
                postId: targetPosts.id,
                userId: sql`${userId}`.as("user_id"),
                posterId: targetPosts.userId,
                createdAt: sql`now()`.as("created_at"),
            })
            .from(targetPosts)
        )
        .onConflictDoNothing()
        .returning()
    // Increase the counters in redis
    const tx = redisClient.multi()
    createdClicks.forEach(click => {
        tx.incr(postClickCounterRedis(click.postId))
    });
    // Create jobs to update the click counts in the database
    const jobsPromise = standardJobs.addJobs(createdClicks.map(click => ({
        category: "clickCount",
        data: click.postId,
        delay: defaultDelay
    })))
    // Update engagement history
    const engagementHistoryJobPromise = scheduleEngagementHistoryUpdate(userId)
    // Execute the promises
    await Promise.all([jobsPromise, tx.exec(), engagementHistoryJobPromise])
}

export default router