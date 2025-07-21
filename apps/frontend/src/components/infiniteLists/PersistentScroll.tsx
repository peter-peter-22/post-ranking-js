import { QueryKey, UseInfiniteQueryResult } from "@tanstack/react-query";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { createContext, ReactNode, useCallback, useContext, useEffect } from "react";
import { queryClient } from "../contexts/TanstackProvider";

export type SaveScrollPositionFn = (
    measurementsCache: VirtualItem[],
    offset: number | null
) => void

export type SavedScrollPosition = {
    scrollOffset: number;
    measurementsCache: VirtualItem[];
}

export type HasSavedScrollPosition = {
    scrollPosition?: SavedScrollPosition
}

type PersistentScrollPositionContextType = {
    saveScrollPositionFn: SaveScrollPositionFn,
    scrollPosition?: SavedScrollPosition,
    queryKey: QueryKey
}

const PersistentScrollContext = createContext<PersistentScrollPositionContextType | undefined>(undefined)

/** Save and load scroll position using the query cache and the virtualizer. */
export function usePersistentScrollVirtualizer<
    TScrollElement extends Window | Element,
    TItemElement extends Element,
    TVirtualizerOptions extends {
        initialOffset?: number | (() => number) | undefined
        initialMeasurementsCache?: VirtualItem[] | undefined
    }
>(
    virtualizerOptions: TVirtualizerOptions,
    getVirtualizer: (options: TVirtualizerOptions) => Virtualizer<TScrollElement, TItemElement>,
) {
    // Get context
    const context = useContext(PersistentScrollContext)
    if (!context) throw new Error("usePersistentScroll must be used within a PersistentScrollContext")
    const { saveScrollPositionFn, scrollPosition, queryKey } = context

    // Load scroll position if it exists
    const virtualizer = getVirtualizer({
        ...virtualizerOptions,
        initialMeasurementsCache: scrollPosition?.measurementsCache,
        initialOffset: scrollPosition?.scrollOffset,
    })

    // Save scroll position on unmount
    useEffect(() => {
        console.log(`Loaded scroll position from ${queryKey}: ${scrollPosition?.scrollOffset}`)
        return () => {
            if (!saveScrollPositionFn) return
            saveScrollPositionFn(virtualizer.measurementsCache, virtualizer.scrollOffset)
            console.log(`Saved scroll position for ${queryKey}: ${virtualizer.scrollOffset}`)
        }
    }, [virtualizer, queryKey])

    // Return the virtualizer
    return virtualizer
}

export function PersistentScrollProvider<TData extends HasSavedScrollPosition, TError>({
    queryKey,
    infiniteQuery,
    children
}: {
    queryKey: QueryKey,
    infiniteQuery: UseInfiniteQueryResult<TData, TError>
    children: ReactNode,
}) {
    /** Function to save the scroll position. */
    const saveScrollPostition: SaveScrollPositionFn = useCallback((measurementsCache, offset) => {
        queryClient.setQueryData<HasSavedScrollPosition>(queryKey, data => {
            if (data && offset !== null)
                data.scrollPosition = {
                    measurementsCache: measurementsCache,
                    scrollOffset: offset
                }
            return data
        })
    }, [queryKey])

    return (
        <PersistentScrollContext.Provider
            value={{
                scrollPosition: infiniteQuery.data?.scrollPosition,
                saveScrollPositionFn: saveScrollPostition,
                queryKey
            }}
            key={queryKey.join(",")}
        >
            {children}
        </PersistentScrollContext.Provider>
    )
}