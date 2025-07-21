import { z } from "zod"
import { apiClient } from "../api"
import { PersonalPostSchema } from "@me/schemas/src/zod/post"

export async function deletePost(id: string) {
    await apiClient.post("/userActions/deletePost", { id })
}

const PostRestorationResponse = z.object({
    post: PersonalPostSchema
})

export async function restorePost(id: string) {
    const res = await apiClient.post("/userActions/deletePost/restore", { id })
    const { post } = PostRestorationResponse.parse(res.data)
    return post
}