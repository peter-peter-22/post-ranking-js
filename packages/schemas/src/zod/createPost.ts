import z from "zod"
import { PersonalPostSchema } from "./post"
import { getEffectiveLength, maxPostTextLength } from "../postCharacterCounter"
import { ServerMediaSchema } from "./media"

export const CreatePostResponseSchema = z.object({
    created: PersonalPostSchema
})

export type CreatePostResponse = z.infer<typeof CreatePostResponseSchema>

export const UpdatePostResponseSchema = z.object({
    post: PersonalPostSchema
})

export type UpdatePostResponse = z.infer<typeof UpdatePostResponseSchema>

export const CreatePendingPostResponseSchma = z.object({
    id: z.string()
})

export type CreatePendingPostResponse = z.infer<typeof CreatePendingPostResponseSchma>

export const CreatePostFormSchema = z
    .object({
        text: z.string(),
        media: z.array(ServerMediaSchema),
    })
    .refine(data => getEffectiveLength(data.text) < maxPostTextLength, { message: "The text is too long", path: ["text"] })
    .refine(data => data.text.length !== 0 || data.media.length !== 0, { message: "Either text or media is required", path: ["text"] })

export type PostFormData = z.infer<typeof CreatePostFormSchema>

export const CreatePostRequestSchema = z.object({
    text: z.string().optional(),
    replyingTo: z.string().optional(),
    media: z.array(ServerMediaSchema).optional()
})

export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>

export const FinalizePostRequestSchema = CreatePostRequestSchema.extend({
    id: z.string()
})

export type FinalizePostRequest = z.infer<typeof FinalizePostRequestSchema>

export const UpdatePostRequestSchema = CreatePostRequestSchema.extend({
    id: z.string()
})

export type UpdatePostRequest = z.infer<typeof UpdatePostRequestSchema>
