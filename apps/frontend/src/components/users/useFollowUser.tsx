import { followUser, unfollowUser } from "../../api/users/follow";
import { useOptimisticToggle } from "../../hooks/useOptimisticUpdate";
import { requireUser, useMainStore } from "../globalStore/mainStore";

export function useFollowUser(userId: string) {
    const followed=Boolean(useMainStore(requireUser(userId,user=>user.followed)))

    const data=useOptimisticToggle({
        mutateValue: async (value)=>{
            if(value) await followUser(userId)
            else await unfollowUser(userId)
        },
        onToggle:(value)=>{useMainStore.getState().updateUser(userId, { followed: value })},
        currentValue:followed,
    })

    return {
        toggleFollow:data.toggle,
        isPending:data.isPending,
        error: data.error,
        followed
    }
}