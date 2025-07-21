import { useWindowVirtualizer, VirtualizerOptions } from "@tanstack/react-virtual";
import { useRef } from "react";
import { Notification } from "../../api/notifications";
import { usePersistentScrollVirtualizer } from "../infiniteLists/PersistentScroll";
import NotificationListDisplayer from "./NotificationListDisplayer";

export type NotificationListProps = {
    notifications: Notification[],
    virtualizerProps?: Partial<Omit<VirtualizerOptions<Window, Element>, "count" | "estimateSize" | "scrollMargin">>,
    isFetching?: boolean,
    fetchNextPage?: () => void,
    hasNextPage: boolean
}

/** Virtualized notification list with scroll restoration. */
export function NotificationListPersistentScroll({
    notifications,
    virtualizerProps,
    ...props
}: NotificationListProps) {
    const listRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = usePersistentScrollVirtualizer(
        {
            count: notifications.length,
            estimateSize: () => 100,
            scrollMargin: listRef.current?.offsetTop ?? 0,
            ...virtualizerProps
        },
        useWindowVirtualizer
    )

    return (
        <NotificationListDisplayer
            notifications={notifications}
            {...props}
            ref={listRef}
            virtualizer={virtualizer}
        />
    )
}

/** Virtualized notification list without scroll restoration. */
export function NotificationList({
    notifications,
    virtualizerProps,
    ...props
}: NotificationListProps) {
    const listRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = useWindowVirtualizer(
        {
            count: notifications.length,
            estimateSize: () => 200,
            scrollMargin: listRef.current?.offsetTop ?? 0,
            ...virtualizerProps
        }
    )

    return (
        <NotificationListDisplayer
            notifications={notifications}
            {...props}
            ref={listRef}
            virtualizer={virtualizer}
        />
    )
}