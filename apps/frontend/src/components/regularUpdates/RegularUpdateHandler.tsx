import { useCallback, useEffect } from "react";
import { useAuth } from "../../authentication";
import { createAsyncInterval } from "../../utilities/asyncInterval";
import { useUpdateStore } from "./updateStore";
import { regularUpdate } from "../../api/regularUpdates";
import { clickedPosts, trackedPosts, viewedPosts } from "./updateMemory";
import { PostOnly, useMainStore } from "../globalStore/mainStore";
import { useWindowFocus } from "../../hooks/useWindowFocus";

function RegularUpdateHandler() {
    const { user } = useAuth()
    const authenticated = Boolean(user)
    const windowFocused = useWindowFocus()

    const update = useCallback(async () => {
        // Send update to api
        const { notificationCount, engagementCounts } = await regularUpdate({
            viewedPosts: Array.from(viewedPosts),
            clickedPosts: Array.from(clickedPosts),
            visiblePosts: Array.from(trackedPosts),
        })
        // Apply the engagement counts to the posts
        if (engagementCounts)
            engagementCounts.forEach(e => {
                const changes: Partial<Omit<PostOnly, "id">> = {}
                if (e.likes) changes.likes = e.likes;
                if (e.replies) changes.replies = e.replies;
                if (e.views) changes.views = e.views;
                if (e.clicks) changes.clicks = e.clicks;
                useMainStore.getState().updatePost(e.postId, post => ({ ...post, ...changes }))
            })
        // Apply the notification count
        useUpdateStore.getState().setNotifications(notificationCount)
    }, [])

    useEffect(() => {
        if (!authenticated || !windowFocused) return
        const stop = createAsyncInterval(update, 5000)
        return stop
    }, [authenticated, update, windowFocused])

    return <></>
}

export default RegularUpdateHandler