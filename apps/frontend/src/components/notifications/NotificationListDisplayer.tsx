import List from "@mui/material/List";
import { Virtualizer } from "@tanstack/react-virtual";
import { forwardRef, memo, useEffect } from "react";
import { Notification } from "../../api/notifications";
import NotificationDisplayer, { NotificationDisplayerProps } from "./NotificationDisplayer";
import Divider from "@mui/material/Divider";

export type NotificationListDisplayerProps = {
    notifications: Notification[],
    isFetching?: boolean,
    fetchNextPage?: () => void,
    hasNextPage: boolean,
    virtualizer: Virtualizer<Window, Element>
}

/** Display the contents of a notification virtualizer. */
const NotificationListDisplayer = forwardRef<HTMLDivElement, NotificationListDisplayerProps>(({
    notifications,
    isFetching,
    fetchNextPage,
    hasNextPage,
    virtualizer,
}, listRef) => {
    const items = virtualizer.getVirtualItems()
    const reachedEnd = items.length > 0 && items[items.length - 1].index === notifications.length - 1

    useEffect(() => {
        if (hasNextPage && reachedEnd && !isFetching && fetchNextPage)
            fetchNextPage()
    }, [reachedEnd, isFetching, fetchNextPage, hasNextPage])

    return (
        <div style={{ position: "relative", height: virtualizer.getTotalSize() }} ref={listRef} >
            <List
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${(items[0]?.start ?? 0) - (virtualizer.options.scrollMargin ?? 0)}px)`,
                    padding: 0
                }}
            >
                {items.map((item) => (
                    <div
                        key={item.key}
                        data-index={item.index}
                        ref={virtualizer.measureElement}
                    >
                        <NotificationDisplayerMemo notification={notifications[item.index]} />
                        <Divider />
                    </div>
                ))}
            </List>
        </div>
    )
})

const NotificationDisplayerMemo = memo((props: NotificationDisplayerProps) => (
    <NotificationDisplayer  {...props} />
))

export default NotificationListDisplayer