import { EditProfileForm, UpdateUserResponseSchema } from "@me/schemas/src/zod/createUser";
import { apiClient } from "../api";

export async function updateUser(data: EditProfileForm) {
    const res = await apiClient.post("/userActions/updateUser", data)
    const { user } = UpdateUserResponseSchema.parse(res.data)
    return user
}