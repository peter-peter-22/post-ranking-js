/** Fetch dehydrated posts, or hydrate the available dehydrated posts. */
export async function fetchNextHydratableData<TDehydrated, THydrated>({
    dehydrated,
    minDehydrated,
    hydratedPerPage,
    hydrateFn,
    getMore,
}: {
    dehydrated: TDehydrated[],
    minDehydrated: number,
    hydratedPerPage: number,
    hydrateFn: (ctx: { dehydrated: TDehydrated[] }) => Promise<{ hydrated: THydrated[] }>,
    getMore: () => Promise<{ hydrated: THydrated[], dehydrated: TDehydrated[] }>
}) {
    // If enough dehydrated posts are available, hydrate them 
    if (dehydrated.length > minDehydrated) {
        const toHydrate = dehydrated.slice(0, hydratedPerPage)
        const { hydrated } = await hydrateFn({ dehydrated: toHydrate })
        const remaining = dehydrated.slice(hydratedPerPage)
        return { hydrated, dehydrated: remaining }
    }
    // Otherwise fetch more from the server
    return await getMore()
}