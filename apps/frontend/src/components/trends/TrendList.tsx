import { useWindowVirtualizer, VirtualizerOptions } from "@tanstack/react-virtual";
import { useRef } from "react";
import { usePersistentScrollVirtualizer } from "../infiniteLists/PersistentScroll";
import { Trend } from '../../../../types/trend';
import TrendListDisplayer from "./TrendListDisplayer";

export type TrendListProps = {
    trends: Trend[],
    virtualizerProps?: Partial<Omit<VirtualizerOptions<Window, Element>, "count" | "estimateSize" | "scrollMargin">>,
    isFetching?: boolean,
    fetchNextPage?: () => void,
    hasNextPage: boolean
}

/** Virtualized trend list with scroll restoration. */
export function TrendListPersistentScroll({
    trends,
    virtualizerProps,
    ...props
}: TrendListProps) {
    const listRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = usePersistentScrollVirtualizer(
        {
            count: trends.length,
            estimateSize: () => 100,
            scrollMargin: listRef.current?.offsetTop ?? 0,
            ...virtualizerProps
        },
        useWindowVirtualizer
    )

    return (
        <TrendListDisplayer
            trends={trends}
            {...props}
            ref={listRef}
            virtualizer={virtualizer}
        />
    )
}

/** Virtualized trend list without scroll restoration. */
export function TrendList({
    trends,
    virtualizerProps,
    ...props
}: TrendListProps) {
    const listRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = useWindowVirtualizer(
        {
            count: trends.length,
            estimateSize: () => 200,
            scrollMargin: listRef.current?.offsetTop ?? 0,
            ...virtualizerProps
        }
    )

    return (
        <TrendListDisplayer
            trends={trends}
            {...props}
            ref={listRef}
            virtualizer={virtualizer}
        />
    )
}