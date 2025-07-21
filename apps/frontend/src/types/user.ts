import { ServerMediaSchema } from "@me/schemas/zod/media"
import { z } from "zod"

export const UserSchema=z.object({
    id:z.string(),
    name:z.string(),
    handle:z.string(),
    bio:z.string().nullable(),
    avatar: ServerMediaSchema.nullable(),
    banner:ServerMediaSchema.nullable(),
    createdAt:z.coerce.date(),
    followerCount:z.number(),
    followingCount:z.number(),
    followed:z.boolean().optional(),
})

export type User=z.infer<typeof UserSchema>
