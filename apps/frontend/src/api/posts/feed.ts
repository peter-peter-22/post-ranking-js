import { z } from "zod";
import { apiClient } from "../api";
import { PersonalPostSchema } from "@me/schemas/src/zod/post";

const PostListResponse = z.object({
    posts: PersonalPostSchema.array(),
})

export async function getMainFeed(offset?: number) {
    const res = await apiClient.post("/userActions/feed", { offset })
    return PostListResponse.parse(res.data).posts
}

export async function getFollowedFeed(offset?: number) {
    const res = await apiClient.post("/userActions/feed/followed", { offset })
    return PostListResponse.parse(res.data).posts
}

export async function getRelevantPosts(postId: string, offset?: number) {
    const res = await apiClient.post(`/userActions/relevantPosts/${postId}`, { offset })
    return PostListResponse.parse(res.data).posts
}

export async function getCommentSection({ postId, offset }: { postId: string, offset?: number }) {
    const res = await apiClient.post(`/userActions/commentSection/${postId}`, { offset })
    return PostListResponse.parse(res.data).posts
}

export async function getUserContents({ userId, replies, offset }: { userId: string, replies: boolean, offset?: number }) {
    const res = await apiClient.post(`/userActions/userContents/${userId}/${replies ? "replies" : "posts"}`, { offset })
    return PostListResponse.parse(res.data).posts
}

export async function searchLatestPosts({ offset, text }: { offset?: number, text:string }) {
    const filters=processPostSearchText(text)
    const res = await apiClient.post(`/userActions/searchPosts/latest?${new URLSearchParams(filters).toString()}`, { offset })
    return PostListResponse.parse(res.data).posts
}

export async function searchTopPosts({ offset, text }: { offset?: number, text:string }) {
    const filters=processPostSearchText(text)
    const res = await apiClient.post(`/userActions/searchPosts/top?${new URLSearchParams(filters).toString()}`, { offset })
    return PostListResponse.parse(res.data).posts
}

/** Extract the filter commands from the search text */
function processPostSearchText(text: string): {
    text?: string,
    userFilter?: string
} {
    let userFilter: string | undefined = undefined
    const cleanText = text
        .replace(/from:(\S+)/gm, (_, captured) => {
            userFilter = captured as string;
            return ""
        })
        .trim()
    return {
        text: cleanText,
        userFilter
    }
}