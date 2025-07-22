import z from "zod"
import { ServerMediaSchema } from "./media"
import { ClientUserSchema } from "./user"
import { TrendSchema } from "./trends"

const UserHandleSchema = z
    .string()
    .regex(/^[a-z0-9_]+$/, {
        message: "Only letters, numbers, and underscores are allowed"
    })
    .max(50)

const UserNameSchema = z
    .string()
    .max(50)

export const LoginSchema = z.object({
    userHandle: UserHandleSchema
})
export type LoginFormData = z.infer<typeof LoginSchema>

export const EditProfileFormSchema = z.object({
    name: UserNameSchema,
    handle: UserHandleSchema,
    profileMedia: ServerMediaSchema.optional().nullable(),
    bannerMedia: ServerMediaSchema.optional().nullable(),
    bio: z.string().max(200)
})
export type EditProfileForm = z.infer<typeof EditProfileFormSchema>

export const UpdateUserResponseSchema = z.object({
    user: ClientUserSchema
})
export type UpdateUserResponse=z.infer<typeof UpdateUserResponseSchema>

export const AuthCommonDataResponse = z.object({
    whoToFollow: z.array(ClientUserSchema),
    trends: z.array(TrendSchema)
})
export type CommonDataResponse = z.infer<typeof AuthCommonDataResponse>

export const AuthResponseSchema = z.object({
    user: ClientUserSchema,
    common: AuthCommonDataResponse
})
export type AuthResponse=z.infer<typeof AuthResponseSchema>
