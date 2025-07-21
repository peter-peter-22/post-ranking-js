import z from "zod";
import { PersonalPostSchema } from "./post";

export const GetPostSchema = z.object({
    id: z.string()
})

export type GetPostRequest = z.infer<typeof GetPostSchema>

export const GetPostResponseSchema = z.object({
    post: PersonalPostSchema,
    replied: PersonalPostSchema.optional()
})

export type GetPostResponse = z.infer<typeof GetPostResponseSchema>
