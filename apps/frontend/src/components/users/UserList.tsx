import { useWindowVirtualizer, VirtualizerOptions } from "@tanstack/react-virtual";
import { useRef } from "react";
import { usePersistentScrollVirtualizer } from "../infiniteLists/PersistentScroll";
import UserListDisplayer from "./UserListDisplayer";

export type UserListProps = {
    userIds: string[],
    virtualizerProps?: Partial<Omit<VirtualizerOptions<Window, Element>, "count" | "estimateSize" | "scrollMargin">>,
    isFetching?: boolean,
    fetchNextPage?: () => void,
    hasNextPage: boolean
}

/** Virtualized user list with scroll restoration. */
export function UserListPersistentScroll({
    userIds,
    virtualizerProps,
    ...props
}: UserListProps) {
    const listRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = usePersistentScrollVirtualizer(
        {
            count: userIds.length,
            estimateSize: () => 100,
            scrollMargin: listRef.current?.offsetTop ?? 0,
            ...virtualizerProps
        },
        useWindowVirtualizer
    )

    return (
        <UserListDisplayer
            userIds={userIds}
            {...props}
            ref={listRef}
            virtualizer={virtualizer}
        />
    )
}

/** Virtualized user list without scroll restoration. */
export function UserList({
    userIds,
    virtualizerProps,
    ...props
}: UserListProps) {
    const listRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = useWindowVirtualizer(
        {
            count: userIds.length,
            estimateSize: () => 200,
            scrollMargin: listRef.current?.offsetTop ?? 0,
            ...virtualizerProps
        }
    )

    return (
        <UserListDisplayer
            userIds={userIds}
            {...props}
            ref={listRef}
            virtualizer={virtualizer}
        />
    )
}


