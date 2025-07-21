import { apiClient } from "../api";

export async function followUser(id: string) {
    await apiClient.post(`/userActions/follow/create`, { followedId: id })
    console.log(`Followed ${id}`)
}

export async function unfollowUser(id: string) {
    await apiClient.post(`/userActions/follow/remove`, { followedId: id })
    console.log(`Unfollowed ${id}`)
}