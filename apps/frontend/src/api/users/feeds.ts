import { z } from "zod";
import { apiClient } from "../api";
import { UserSchema } from "@me/schemas/src/zod/user";

const UserListResponseSchema = z.object({
    users: UserSchema.array(),
})

export async function searchUsers({offset,text}:{offset?: number,text:string}) {
    const res = await apiClient.post(`/userActions/searchUsers?${new URLSearchParams({text}).toString()}`, { offset })
    return UserListResponseSchema.parse(res.data).users
}

export async function followersOfUser({offset,userHandle}:{offset?: number,userHandle:string}) {
    const res = await apiClient.post(`/userActions/listFollows/followers/${userHandle}`, { offset })
    return UserListResponseSchema.parse(res.data).users
}

export async function followedOfUser({offset,userHandle}:{offset?: number,userHandle:string}) {
    const res = await apiClient.post(`/userActions/listFollows/followed/${userHandle}`, { offset })
    return UserListResponseSchema.parse(res.data).users
}