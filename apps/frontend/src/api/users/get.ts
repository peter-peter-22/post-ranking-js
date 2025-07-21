import { z } from "zod";
import { UserSchema } from "../../types/user";
import { apiClient } from "../api";

const UserResponseSchema = z.object({
    user: UserSchema
})

export async function fetchUser(handle: string) {
    const res = await apiClient.get(`/getUser/${handle}`)
    const { user } = UserResponseSchema.parse(res.data)
    return user
}