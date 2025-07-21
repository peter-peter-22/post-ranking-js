import { queryClient } from "../../components/contexts/TanstackProvider";
import { processUsers, useMainStore } from "../../components/globalStore/mainStore";
import { fetchUser } from "./get";

export async function getCachedUser(handle: string) {
    return await queryClient.ensureQueryData({
        queryKey: ["users", handle],
        queryFn: async () => {
            // First try to get the user from zustand
            const cached = useMainStore.getState().usersByHandle.get(handle)
            if (cached) return cached
            // Otherwise, fetch the post
            const newUser = await fetchUser(handle)
            if (!newUser) throw new Error("Post not found")
            processUsers([newUser])
            return newUser
        }
    })
}