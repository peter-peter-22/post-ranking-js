import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import { processPosts } from "../../components/globalStore/mainStore";
import InfiniteListLoading from "../../components/infiniteLists/InfiniteListLoading";
import { HasSavedScrollPosition, PersistentScrollProvider } from "../../components/infiniteLists/PersistentScroll";
import { PostList, PostListPersistentScroll } from "../../components/posts/PostList";
import { Post } from "../../types/post";
import { InfiniteListErrorFormatted } from "../infiniteLists/InfiniteListError";

export type PostsInfiniteQueryData = InfiniteData<string[]> & HasSavedScrollPosition
type PostsPageParams = { offset: number } | undefined

type QueryType = ReturnType<typeof useInfiniteQuery<
    string[],
    Error,
    PostsInfiniteQueryData,
    QueryKey,
    PostsPageParams
>>

export type PostFeedProps = {
    query: QueryType;
    allPosts: string[]
    queryKey: QueryKey
}

export function DefaultPostFeedListComponent({ queryKey, query, allPosts }: PostFeedProps) {
    return (
        <PersistentScrollProvider queryKey={queryKey} infiniteQuery={query}>
            <PostListPersistentScroll
                postIds={allPosts}
                fetchNextPage={() => { query.fetchNextPage() }}
                isFetching={query.isFetching}
                hasNextPage={query.hasNextPage}
            />
        </PersistentScrollProvider>
    )
}

export function PostFeedListComponentNoScroll({ query, allPosts }: PostFeedProps) {
    return (
        <PostList
            postIds={allPosts}
            fetchNextPage={() => { query.fetchNextPage() }}
            isFetching={query.isFetching}
            hasNextPage={query.hasNextPage}
        />
    )
}

export default function PostFeed({
    queryKey,
    queryFn,
    ListComponent = DefaultPostFeedListComponent,
}: {
    queryKey: QueryKey,
    queryFn: (offset?: number) => Promise<Post[]>,
    ListComponent?: (props: PostFeedProps) => ReactNode,
}) {
    const query = useInfiniteQuery<
        string[],
        Error,
        PostsInfiniteQueryData,
        QueryKey,
        PostsPageParams
    >({
        queryKey,
        initialPageParam: undefined,
        queryFn: async ({ pageParam }) => {
            return processPosts(await queryFn(pageParam?.offset))
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.length === 0)
                return undefined
            return {
                offset: pages.flat().length
            }
        },
    });

    const allPosts = useMemo(() => (
        query.data?.pages.flat()
    ), [query.data])

    const {
        isPending,
        error,
    } = query

    return (
        error ? (
            <InfiniteListErrorFormatted title="Error while loading posts" error={error} />
        ) : isPending || !allPosts ? (
            <InfiniteListLoading />
        ) : (
            <ListComponent queryKey={queryKey} query={query} allPosts={allPosts} />
        )
    )
}