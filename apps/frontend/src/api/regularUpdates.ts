import { z } from "zod"
import { apiClient } from "./api"

type RegularUpdateOptions = {
    viewedPosts: string[],
    clickedPosts: string[],
    visiblePosts: string[]
}

const RealTimeEngagementsSchema = z.object({
    postId: z.string(),
    likes: z.number().optional(),
    clicks: z.number().optional(),
    views: z.number().optional(),
    replies: z.number().optional()
})

const RegularUpdateResponseSchema = z.object({
    engagementCounts: RealTimeEngagementsSchema.array().optional(),
    notificationCount: z.number(),
})

export async function regularUpdate(data: RegularUpdateOptions) {
    const res = await apiClient.post("/userActions/regularUpdates", data)
    return RegularUpdateResponseSchema.parse(res.data)
}