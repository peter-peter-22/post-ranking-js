import { EngagementActionResult, ProcessContext } from "."
import { createLikeNotification } from "../../../../db/controllers/notifications/createNotification"
import { postContentRedisKey, postLikersRedisKey } from "../../../../redis/postContent"

export function setLikes(userId: string, actions: EngagementActionResult[], ctx: ProcessContext) {
    for (const action of actions) {
        ctx.redis.hIncrBy(postContentRedisKey(action.post.id), "likeCount", action.value ? 1 : -1)
        // Tracking the likers is unnecessary when the post is not ranked
        if (action.post.rankingExists) {
            if (action.value) ctx.redis.sAdd(postLikersRedisKey(action.post.id), userId)
            else ctx.redis.sRem(postLikersRedisKey(action.post.id), userId)
        }
        if (action.value) ctx.promises.push(createLikeNotification(userId, action.post.id, action.date))
    }
}