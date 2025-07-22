import Box from "@mui/material/Box";
import { Virtualizer } from "@tanstack/react-virtual";
import { forwardRef, memo, useEffect } from "react";
import { Trend } from '../../../../types/trend';
import TrendDisplayer, { TrendDisplayerProps } from "./TrendDisplayer";

export type TrendListDisplayerProps = {
    trends: Trend[],
    isFetching?: boolean,
    fetchNextPage?: () => void,
    hasNextPage: boolean,
    virtualizer: Virtualizer<Window, Element>
}

/** Display the contents of a user virtualizer. */
const TrendListDisplayer = forwardRef<HTMLDivElement, TrendListDisplayerProps>(({
    trends,
    isFetching,
    fetchNextPage,
    hasNextPage,
    virtualizer,
}, listRef) => {
    const items = virtualizer.getVirtualItems()
    const reachedEnd = items.length > 0 && items[items.length - 1].index === trends.length - 1

    useEffect(() => {
        if (hasNextPage && reachedEnd && !isFetching && fetchNextPage)
            fetchNextPage()
    }, [reachedEnd, isFetching, fetchNextPage, hasNextPage])

    return (
        <div style={{ position: "relative", height: virtualizer.getTotalSize() }} ref={listRef} >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${(items[0]?.start ?? 0) - (virtualizer.options.scrollMargin ?? 0)}px)`,
                }}
            >
                {items.map((item) => (
                    <div
                        key={item.key}
                        data-index={item.index}
                        ref={virtualizer.measureElement}
                    >
                        <TrendDisplayerMemo trend={trends[item.index]} index={item.index} />
                    </div>
                ))}
            </div>
        </div>
    )
})

const TrendDisplayerMemo = memo((props: TrendDisplayerProps) => (
    <Box sx={{ pb: 2 }}>
        <TrendDisplayer  {...props} />
    </Box>
))

export default TrendListDisplayer