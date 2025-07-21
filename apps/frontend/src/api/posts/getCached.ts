import { processPosts, useMainStore } from "../../components/globalStore/mainStore";
import { fetchPost } from "./get";

export async function getSinglePost(id: string) {
    // Try to get the post from zustand
    const cachedPost = useMainStore.getState().posts.get(id)
    if (cachedPost) {
        // If exists and is a reply, try to get the replied post
        if (cachedPost.replyingTo && !useMainStore.getState().posts.has(cachedPost.replyingTo)) {
            // If no replied post in zustand, fetch
            const { post: replied, replied: other } = await fetchPost({id:cachedPost.replyingTo})
            processPosts([replied])
            if (other) processPosts([other])
        }
        // If everything exists, return the cached post
        return cachedPost
    }
    // If no post, fetch
    const { post: newPost, replied } = await fetchPost({id})
    processPosts([newPost])
    if (replied) processPosts([replied])
    return newPost
}