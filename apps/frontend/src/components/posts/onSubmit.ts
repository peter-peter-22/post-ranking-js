import { QueryKey } from "@tanstack/react-query"
import { Post } from "../../types/post"
import { PostsInfiniteQueryData } from "./PostFeed"
import { queryClient } from "../contexts/TanstackProvider"
import { processPosts } from "../globalStore/mainStore"

export function updatePostFeedOnSubmit(post: Post, queryKey: QueryKey) {
    queryClient.setQueryData<PostsInfiniteQueryData>(queryKey, (prev) => {
        const [id] = processPosts([post])
        if (!prev) return
        const { pages, ...rest } = prev
        return { pages: [[id], ...pages], ...rest }
    })
}