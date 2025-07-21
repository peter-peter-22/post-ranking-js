import { z } from "zod"

const TrendCategorySchema = z.enum(["global", "personal"])

export type TrendCategory = z.infer<typeof TrendCategorySchema>

export const TrendSchema = z.object({
    category: TrendCategorySchema,
    keyword: z.string(),
    postCount: z.number(),
})

export type Trend = z.infer<typeof TrendSchema>