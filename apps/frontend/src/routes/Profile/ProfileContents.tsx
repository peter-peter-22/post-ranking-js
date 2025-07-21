import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getUserContents } from "../../api/posts/feed";
import { processPosts } from "../../components/globalStore/mainStore";
import { InfiniteListErrorFormatted } from "../../components/infiniteLists/InfiniteListError";
import InfiniteListLoading from "../../components/infiniteLists/InfiniteListLoading";
import { HasSavedScrollPosition, PersistentScrollProvider } from "../../components/infiniteLists/PersistentScroll";
import { PostListPersistentScroll } from "../../components/posts/PostList";

type PostsQueryData = InfiniteData<string[]> & HasSavedScrollPosition
type PostsPageParams = { displayed: string[] } | undefined

export default function UserContents({ userId, replies }: { userId: string, replies: boolean }) {
    const queryKey = useMemo(() => ["user contents", userId, replies ? "replies" : "posts"], [userId, replies])

    const { query, allPosts } = useUserContentsQuery(queryKey, userId, replies)

    const {
        hasNextPage,
        fetchNextPage,
        isFetching,
        isPending,
        error,
    } = query

    return (
        error ? (
            <InfiniteListErrorFormatted title={`Error while loading ${replies ? "replies" : "posts"}`} error={error} />
        ) : isPending || !allPosts ? (
            <InfiniteListLoading />
        ) : allPosts.length === 0 ? (
            <Paper sx={{ p: 2 }}><Typography color="textSecondary">No {replies ? "replies" : "posts"} yet</Typography></Paper>
        ) : (
            <PersistentScrollProvider queryKey={queryKey} infiniteQuery={query}>
                <PostListPersistentScroll
                    postIds={allPosts}
                    fetchNextPage={() => { fetchNextPage() }}
                    isFetching={isFetching}
                    hasNextPage={hasNextPage}
                />
            </PersistentScrollProvider>
        )
    )
}

async function userContentsQuery(pageParam: PostsPageParams | undefined, userId: string, replies: boolean) {
    const data = await getUserContents({
        userId,
        replies,
        offset: pageParam?.displayed.length
    })
    return processPosts(data)
}

function useUserContentsQuery(queryKey: QueryKey, userId: string, replies: boolean) {
    const query = useInfiniteQuery<
        Awaited<ReturnType<typeof userContentsQuery>>,
        Error,
        PostsQueryData,
        QueryKey,
        PostsPageParams
    >({
        queryKey,
        initialPageParam: undefined,
        queryFn: async ({ pageParam }) => {
            return await userContentsQuery(pageParam, userId, replies)
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.length === 0)
                return undefined
            return {
                displayed: pages.flat()
            }
        },
    });

    const allPosts = useMemo(() => (
        query.data?.pages.flat()
    ), [query.data])

    return { query, allPosts }
}