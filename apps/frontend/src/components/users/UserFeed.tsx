import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import { User } from "@me/schemas/src/zod/user";
import { processUsers } from "../globalStore/mainStore";
import InfiniteListLoading from "../infiniteLists/InfiniteListLoading";
import { HasSavedScrollPosition, PersistentScrollProvider } from "../infiniteLists/PersistentScroll";
import { UserList, UserListPersistentScroll } from "./UserList";
import { InfiniteListErrorFormatted } from "../infiniteLists/InfiniteListError";

type UsersQueryData = InfiniteData<string[]> & HasSavedScrollPosition
type UsersPageParams = { offset: number } | undefined

type QueryType = ReturnType<typeof useInfiniteQuery<
    string[],
    Error,
    UsersQueryData,
    QueryKey,
    UsersPageParams
>>

export type UserFeedProps = {
    query: QueryType;
    allUsers: string[]
    queryKey: QueryKey
}

export function DefaultUserFeedListComponent({ queryKey, query, allUsers }: UserFeedProps) {
    return (
        <PersistentScrollProvider queryKey={queryKey} infiniteQuery={query}>
            <UserListPersistentScroll
                userIds={allUsers}
                fetchNextPage={() => { query.fetchNextPage() }}
                isFetching={query.isFetching}
                hasNextPage={query.hasNextPage}
            />
        </PersistentScrollProvider>
    )
}

export function UserFeedListComponentNoScroll({ query, allUsers }: UserFeedProps) {
    return (
        <UserList
            userIds={allUsers}
            fetchNextPage={() => { query.fetchNextPage() }}
            isFetching={query.isFetching}
            hasNextPage={query.hasNextPage}
        />
    )
}

export default function UserFeed({
    queryKey,
    queryFn,
    ListComponent = DefaultUserFeedListComponent
}: {
    queryKey: QueryKey,
    queryFn: (offset?: number) => Promise<User[]>,
    ListComponent?: (props: UserFeedProps) => ReactNode
}) {
    const query = useInfiniteQuery<
        string[],
        Error,
        UsersQueryData,
        QueryKey,
        UsersPageParams
    >({
        queryKey,
        initialPageParam: undefined,
        queryFn: async ({ pageParam }) => {
            return processUsers(await queryFn(pageParam?.offset))
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
            <InfiniteListErrorFormatted title="Error while loading users" error={error} />
        ) : isPending || !allPosts ? (
            <InfiniteListLoading />
        ) : (
            <ListComponent queryKey={queryKey} query={query} allUsers={allPosts} />
        )
    )
}