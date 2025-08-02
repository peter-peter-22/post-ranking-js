import { Router } from "express";
import { isArray } from "mathjs";
import { z } from "zod";
import { authRequestStrict } from "../../authentication";
import { getNotificationCount } from "../../db/controllers/notifications/getCount";
import { redisClient } from "../../redis/connect";
import { postContentRedisKey } from "../../redis/postContent";
import { userActions } from "../../userActions/main";

const router = Router();

const RegularUpdateSchema = z.object({
    viewedPosts: z.string().array(),
    clickedPosts: z.string().array(),
    visiblePosts: z.string().array()
})

router.post('/', async (req, res) => {
    const user = await authRequestStrict(req)
    const { viewedPosts, clickedPosts, visiblePosts } = RegularUpdateSchema.parse(req.body);
    const [engagementCounts, notificationCount] = await Promise.all([
        handleVisiblePosts(visiblePosts),
        getNotificationCount(user.id),
        userActions.posts.engagements.actions.clicks.add(user.id, clickedPosts),
        userActions.posts.engagements.actions.views.add(user.id, viewedPosts),
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
        tx.hmGet(postContentRedisKey(postId), ["likeCount", "clickCount", "replyCount", "viewCount"])
    }
    const results = await tx.exec()
    // Format the results
    const parsed: RealtimeEngagements[] = []
    for (let i = 0; i < visiblePosts.length; i++) {
        const result = results[i]
        if (!result || !isArray(result)) continue
        const likes = result[0]
        const clicks = result[1]
        const replies = result[2]
        const views = result[3]
        const engagements: RealtimeEngagements = { postId: visiblePosts[i] }
        if (likes) engagements.likes = parseInt(likes.toString())
        if (clicks) engagements.clicks = parseInt(clicks.toString())
        if (replies) engagements.replies = parseInt(replies.toString())
        if (views) engagements.views = parseInt(views.toString())
        parsed.push(engagements)
    }
    return parsed
}

export default router