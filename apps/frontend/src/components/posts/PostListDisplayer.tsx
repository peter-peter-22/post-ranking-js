import Box from "@mui/material/Box";
import { Virtualizer } from "@tanstack/react-virtual";
import { forwardRef, memo, useEffect } from "react";
import PostDisplayerFocusable from "./FocusablePost";
import { PostProvider } from "./PostContext";

export type PostListDisplayerProps = {
    postIds: string[],
    isFetching?: boolean,
    fetchNextPage?: () => void,
    hasNextPage: boolean,
    virtualizer: Virtualizer<Window, Element>
}

/** Display the contents of a post virtualizer. */
const PostListDisplayer = forwardRef<HTMLDivElement, PostListDisplayerProps>(({
    postIds,
    isFetching,
    fetchNextPage,
    hasNextPage,
    virtualizer,
}, listRef) => {
    const items = virtualizer.getVirtualItems()
    const reachedEnd = items.length > 0 && items[items.length - 1].index === postIds.length - 1

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
                        <PostFocusableMemo postId={postIds[item.index]} />
                    </div>
                ))}
            </div>
        </div>
    )
})

const PostFocusableMemo = memo(({ postId }: { postId: string }) => (
    <PostProvider postId={postId}>
        <Box sx={{ pb: 2 }}>
            <PostDisplayerFocusable />
        </Box>
    </PostProvider>
))

export default PostListDisplayer