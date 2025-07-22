import { z } from "zod"
import { ServerMediaSchema } from "./media"

export const ClientUserSchema=z.object({
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

export type ClientUser=z.infer<typeof ClientUserSchema>
