import { z } from "zod";
import { apiClient } from "../api";
import { UserSchema } from "@me/schemas/src/zod/user";

const UserResponseSchema = z.object({
    user: UserSchema
})

export async function fetchUser(handle: string) {
    const res = await apiClient.get(`/getUser/${handle}`)
    const { user } = UserResponseSchema.parse(res.data)
    return user
}