import { z } from "zod";
import { apiClient } from "../api";
import { TrendSchema } from "@me/schemas/src/zod/trends";

const TrendListResponseSchema = z.object({
    trends: TrendSchema.array(),
})

export async function globalTrends({offset}:{offset?: number}) {
    const res = await apiClient.post(`/userActions/trends/global`, { offset })
    return TrendListResponseSchema.parse(res.data).trends
}

export async function personalTrends({offset}:{offset?: number}) {
    const res = await apiClient.post(`/userActions/trends/personal`, { offset })
    return TrendListResponseSchema.parse(res.data).trends
}