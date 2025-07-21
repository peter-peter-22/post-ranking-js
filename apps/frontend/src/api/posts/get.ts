import { GetPostRequest, GetPostResponseSchema } from "@me/schemas/src/zod/getPost";
import { apiClient } from "../api";

export async function fetchPost({ id }: GetPostRequest) {
    const res = await apiClient.get(`/getPost/${id}`)
    return GetPostResponseSchema.parse(res.data)
}