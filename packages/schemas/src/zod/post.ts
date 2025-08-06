import { z } from "zod";
import { ClientUserSchema } from "./user";
import { ServerMediaSchema } from "./media";

export const UserEngagementHistorySchema = z.object({
    likes: z.number(),
    replies: z.number(),
    clicks: z.number(),
    viewerId: z.string(),
    publisherId: z.string(),
})

export const PersonalPostSchema = z.object({
    id: z.string(),
    userId: z.string(),
    text: z.string().nullable(),
    createdAt: z.coerce.date(),
    likes: z.number(),
    replies: z.number(),
    clicks: z.number(),
    views: z.number(),
    similarity: z.number(),
    engagementHistoryScore: z.number(),
    repliedByFollowed: z.boolean(),
    liked: z.boolean(),
    user: ClientUserSchema,
    media: z.array(ServerMediaSchema).nullable(),
    keywords: z.array(z.string()).nullable(),
    embeddingText: z.string().nullable(),
    commentScore: z.number(),
    source: z.string().optional(),
    score: z.number().optional(),
    replyingTo: z.string().nullable(),
    deleted: z.boolean().default(false)
})


export type PersonalPost = z.infer<typeof PersonalPostSchema>;
export type PostToEdit = Pick<PersonalPost, "id" | "text" | "media" | "replyingTo">