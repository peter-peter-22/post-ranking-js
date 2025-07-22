import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import { Trend } from '../../../../types/trend';
import InfiniteListLoading from "../infiniteLists/InfiniteListLoading";
import { HasSavedScrollPosition, PersistentScrollProvider } from "../infiniteLists/PersistentScroll";
import { TrendList, TrendListPersistentScroll } from "./TrendList";
import { InfiniteListErrorFormatted } from "../infiniteLists/InfiniteListError";

type TrendsQueryData = InfiniteData<Trend[]> & HasSavedScrollPosition
type TrendsPageParams = { offset: number } | undefined

type QueryType = ReturnType<typeof useInfiniteQuery<
    string[],
    Error,
    TrendsQueryData,
    QueryKey,
    TrendsPageParams
>>

export type TrendFeedProps = {
    query: QueryType;
    allTrends: Trend[]
    queryKey: QueryKey
}

export function DefaultTrendFeedListComponent({ queryKey, query, allTrends }: TrendFeedProps) {
    return (
        <PersistentScrollProvider queryKey={queryKey} infiniteQuery={query}>
            <TrendListPersistentScroll
                trends={allTrends}
                fetchNextPage={() => { query.fetchNextPage() }}
                isFetching={query.isFetching}
                hasNextPage={query.hasNextPage}
            />
        </PersistentScrollProvider>
    )
}

export function TrendFeedListComponentNoScroll({ query, allTrends }: TrendFeedProps) {
    return (
        <TrendList
            trends={allTrends}
            fetchNextPage={() => { query.fetchNextPage() }}
            isFetching={query.isFetching}
            hasNextPage={query.hasNextPage}
        />
    )
}

export default function TrendFeed({
    queryKey,
    queryFn,
    ListComponent = DefaultTrendFeedListComponent
}: {
    queryKey: QueryKey,
    queryFn: (offset?: number) => Promise<Trend[]>,
    ListComponent?: (props: TrendFeedProps) => ReactNode
}) {
    const query = useInfiniteQuery<
        Trend[],
        Error,
        TrendsQueryData,
        QueryKey,
        TrendsPageParams
    >({
        queryKey,
        initialPageParam: undefined,
        queryFn: async ({ pageParam }) => {
            return await queryFn(pageParam?.offset)
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.length === 0)
                return undefined
            return {
                offset: pages.flat().length
            }
        },
    });

    const allTrends = useMemo(() => (
        query.data?.pages.flat()
    ), [query.data])

    const {
        isPending,
        error,
    } = query

    return (
        error ? (
            <InfiniteListErrorFormatted title="Error while loading trends" error={error} />
        ) : isPending || !allTrends ? (
            <InfiniteListLoading />
        ) : (
            <ListComponent queryKey={queryKey} query={query} allTrends={allTrends} />
        )
    )
}