import { and, eq, inArray } from "drizzle-orm"
import { cachedPersonalEngagements } from "."
import { db } from "../../db"
import { likes } from "../../db/schema/likes"
import { views } from "../../db/schema/views"
import { clicks } from "../../db/schema/clicks"

export const cachedViews = cachedPersonalEngagements({
    getKey: (postId: string, userId: string) => {
        return `post:${postId}:view:${userId}`
    },
    fallback: async (ids: string[], userId: string) => {
        const newData = await db.select().from(views).where(and(eq(views.userId, userId), inArray(views.postId, ids)))
        return new Set<string>(newData.map(view => view.postId))
    }
})

export const cachedLikes = cachedPersonalEngagements({
    getKey: (postId: string, userId: string) => {
        return `post:${postId}:like:${userId}`
    },
    fallback: async (ids: string[], userId: string) => {
        const newData = await db.select().from(likes).where(and(eq(likes.userId, userId), inArray(likes.postId, ids)))
        return new Set<string>(newData.map(like => like.postId))
    }
})

export const cachedClicks = cachedPersonalEngagements({
    getKey: (postId: string, userId: string) => {
        return `post:${postId}:click:${userId}`
    },
    fallback: async (ids: string[], userId: string) => {
        const newData = await db.select().from(clicks).where(and(eq(clicks.userId, userId), inArray(clicks.postId, ids)))
        return new Set<string>(newData.map(like => like.postId))
    }
})