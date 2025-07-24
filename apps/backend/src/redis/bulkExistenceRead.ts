import { redisClient } from "./connect";

export function cachedBulkExistenceCheck({
    getKey,
    fallback,
    getTTL
}: {
    getKey: (id: string) => string,
    fallback: (ids: string[]) => Promise<Set<string>>,
    getTTL: (id: string) => number
}) {
    async function read(ids: string[]) {
        if (ids.length === 0) return new Map<string, boolean | undefined>()
        // Try to read from redis
        let multi = redisClient.multi()
        ids.forEach(id => {
            multi.get(getKey(id))
        })
        const results = await multi.exec()
        // Format the results
        const resultMap = new Map<string, boolean | undefined>(
            ids.map((id, i) => {
                const result = results[i]
                const value = result !== undefined ? result === "true" : undefined
                return [id, value]
            })
        )
        // Fallback to the db if there are missing posts
        const missingIds = [...resultMap.entries()].filter(([_, value]) => value === undefined).map(([id]) => id)
        console.log(`Existence cache hit: ${ids.length - missingIds.length}, cache miss: ${missingIds.length}, total: ${ids.length}`)
        if (missingIds.length > 0) {
            // Fetch the missing values from the db
            const newIds = await fallback(missingIds)
            const multi = redisClient.multi()
            missingIds.forEach(id => {
                const value = newIds.has(id)
                // Add to the results
                resultMap.set(id, value)
                const key = getKey(id)
                // Add to the cache
                multi.set(key, value.toString())
            })
            await multi.exec()
        }
        // Update expiration
        multi = redisClient.multi()
        for (const [id, value] of resultMap.entries()) {
            if (value === undefined) continue
            multi.expire(getKey(id), getTTL(id))
        }
        await multi.exec()
        return resultMap
    }

    return { read }
}