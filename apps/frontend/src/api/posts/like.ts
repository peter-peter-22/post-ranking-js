import { apiClient } from "../api";

export async function likePost(postId: string, value: boolean) {
    await apiClient.post(`/userACtions/like`, { postId, value })
}