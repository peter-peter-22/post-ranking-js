import { QueryKey } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePostFeedStore } from "../globalStore/postFeedStore";

export function usePostFeed(queryKey: QueryKey,postId?:string) {
    useEffect(() => {
        usePostFeedStore.getState().selectFeed(queryKey,postId);
        return () => {
            usePostFeedStore.getState().selectFeed()
        }
    }, [queryKey])
}