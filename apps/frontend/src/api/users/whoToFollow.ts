import { z } from "zod";
import { apiClient } from "../api";
import { queryClient } from "../../components/contexts/TanstackProvider";
import { processUsers } from "../../components/globalStore/mainStore";
import { UserSchema } from "@me/schemas/src/zod/user";

const UserResponseSchema = z.object({
    users: UserSchema.array()
})

export async function getWhoToFollow() {
    const res = await queryClient.ensureQueryData({
        queryKey: ["who to follow"],
        queryFn: async () => await apiClient.get(`/userActions/whoToFollow`),
    })
    const { users } = UserResponseSchema.parse(res.data)
    return processUsers(users)
}

export async function whoToFollowFeed(offset?: number) {
    const res = await apiClient.post("userActions/whoToFollow/feed", { offset })
    const { users } = UserResponseSchema.parse(res.data)
    return users
}