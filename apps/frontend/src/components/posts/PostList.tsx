import { useWindowVirtualizer, VirtualizerOptions } from "@tanstack/react-virtual";
import { useRef } from "react";
import { usePersistentScrollVirtualizer } from "../infiniteLists/PersistentScroll";
import PostListDisplayer from "./PostListDisplayer";

export type PostListProps = {
    postIds: string[],
    virtualizerProps?: Partial<Omit<VirtualizerOptions<Window, Element>, "count" | "estimateSize" | "scrollMargin">>,
    isFetching?: boolean,
    fetchNextPage?: () => void,
    hasNextPage: boolean
}

/** Virtualized post list with scroll restoration. */
export function PostListPersistentScroll({
    postIds,
    virtualizerProps,
    ...props
}: PostListProps) {
    const listRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = usePersistentScrollVirtualizer(
        {
            count: postIds.length,
            estimateSize: () => 200,
            scrollMargin: listRef.current?.offsetTop ?? 0,
            ...virtualizerProps
        },
        useWindowVirtualizer
    )

    return (
        <PostListDisplayer
            postIds={postIds}
            {...props}
            ref={listRef}
            virtualizer={virtualizer}
        />
    )
}

/** Virtualized post list without scroll restoration. */
export function PostList({
    postIds,
    virtualizerProps,
    ...props
}: PostListProps) {
    const listRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = useWindowVirtualizer(
        {
            count: postIds.length,
            estimateSize: () => 200,
            scrollMargin: listRef.current?.offsetTop ?? 0,
            ...virtualizerProps
        }
    )

    return (
        <PostListDisplayer
            postIds={postIds}
            {...props}
            ref={listRef}
            virtualizer={virtualizer}
        />
    )
}


