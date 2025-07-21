import { z } from "zod";
import { ServerMedia } from "../../types/media";
import { apiClient } from "../api";
import { UserSchema } from "../../types/user";

const UpdateUserResponseSchema = z.object({
    user: UserSchema
})

export async function updateUser(data: { name: string, handle: string, bio?: string, avatar?: ServerMedia, banner?: ServerMedia }) {
    const res = await apiClient.post("/userActions/updateUser", data)
    const { user } = UpdateUserResponseSchema.parse(res.data)
    return user
}