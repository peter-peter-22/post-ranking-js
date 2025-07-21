import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import { Notification } from "../../api/notifications";
import { InfiniteListErrorFormatted } from "../infiniteLists/InfiniteListError";
import InfiniteListLoading from "../infiniteLists/InfiniteListLoading";
import { HasSavedScrollPosition, PersistentScrollProvider } from "../infiniteLists/PersistentScroll";
import { NotificationList, NotificationListPersistentScroll } from "./NotificationList";

type NotificationQueryData = InfiniteData<Notification[]> & HasSavedScrollPosition
type NotificationPageParams = { offset: number } | undefined

type QueryType = ReturnType<typeof useInfiniteQuery<
    string[],
    Error,
    NotificationQueryData,
    QueryKey,
    NotificationPageParams
>>

export type NotificationFeedProps = {
    query: QueryType;
    allNotifications: Notification[]
    queryKey: QueryKey
}

export function DefaultNotificationFeedListComponent({ queryKey, query, allNotifications }: NotificationFeedProps) {
    return (
        <PersistentScrollProvider queryKey={queryKey} infiniteQuery={query}>
            <NotificationListPersistentScroll
                notifications={allNotifications}
                fetchNextPage={() => { query.fetchNextPage() }}
                isFetching={query.isFetching}
                hasNextPage={query.hasNextPage}
            />
        </PersistentScrollProvider>
    )
}

export function NotificationFeedListComponentNoScroll({ query, allNotifications }: NotificationFeedProps) {
    return (
        <NotificationList
            notifications={allNotifications}
            fetchNextPage={() => { query.fetchNextPage() }}
            isFetching={query.isFetching}
            hasNextPage={query.hasNextPage}
        />
    )
}

export default function NotificationFeed({
    queryKey,
    queryFn,
    ListComponent = DefaultNotificationFeedListComponent
}: {
    queryKey: QueryKey,
    queryFn: (offset?: number) => Promise<Notification[]>,
    ListComponent?: (props: NotificationFeedProps) => ReactNode
}) {
    const query = useInfiniteQuery<
        Notification[],
        Error,
        NotificationQueryData,
        QueryKey,
        NotificationPageParams
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

    const allNotifications = useMemo(() => (
        query.data?.pages.flat()
    ), [query.data])

    const {
        isPending,
        error,
    } = query

    return (
        error ? (
            <InfiniteListErrorFormatted title="Error while loading notifications" error={error} />
        ) : isPending || !allNotifications ? (
            <InfiniteListLoading />
        ) : (
            <ListComponent queryKey={queryKey} query={query} allNotifications={allNotifications} />
        )
    )
}