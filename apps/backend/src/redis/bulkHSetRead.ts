import { redisClient } from "./connect";
import { HSetValue, TypedHSetHandler } from "./typedHSet";

export function cachedBulkHSetRead<T extends HSetValue>({
    schema,
    getKey,
    getTTL,
    fallback,
    getId
}: {
    schema: TypedHSetHandler<T>,
    getKey: (id: string) => string,
    getId: (value: T) => string,
    getTTL: (data: T) => number
    fallback: (ids: string[]) => Promise<T[]>
}) {
    const fetch = async (ids: string[]) => {
        if (ids.length === 0) return new Map<string, T | undefined>()
        // Try to read from redis
        let multi = redisClient.multi()
        ids.forEach(id => {
            multi.hGetAll(getKey(id))
        })
        const results = await multi.exec()
        // Format the results
        const resultMap = new Map<string, T | undefined>(
            ids.map((id, i) => {
                const result = results[i] as Record<string, string> | undefined
                return ([
                    id,
                    (!result || Object.keys(result).length === 0) ? (
                        undefined
                    ) : (
                        schema.deserialize(result)
                    )
                ])
            })
        )
        // Fallback to the db if there are missing values
        const missingIds = [...resultMap.entries()].filter(([_, value]) => value === undefined).map(([id]) => id)
        console.log(`Hset cache hit: ${ids.length - missingIds.length}, cache miss: ${missingIds.length}, total: ${ids.length}`)
        if (missingIds.length > 0) {
            // Fetch the missing values from the db
            const newData = await fallback(missingIds)
            const multi = redisClient.multi()
            newData.forEach(row => {
                const id = getId(row)
                // Add to the results
                resultMap.set(id, row)
                // Add to the cache
                const key = getKey(id)
                multi.hSet(
                    key,
                    schema.serialize(row)
                )
            })
            await multi.exec()
        }
        // Update expiration
        multi = redisClient.multi()
        for (const [key, value] of resultMap.entries()) {
            if (!value) continue
            multi.expire(getKey(key), getTTL(value))
        }
        await multi.exec()
        return resultMap
    }

    return { read: fetch }
}

export  function cachedBulkHSetWrite<T extends HSetValue>({
    schema,
    getKey,
    getTTL
}: {
    schema: TypedHSetHandler<T>,
    getKey: (id: string) => string,
    getTTL: (data: T) => number
}) {

    const write = async (data: T[]) => {
        const multi = redisClient.multi()
        for (const el of data) {
            multi.hSet(getKey(el.id), schema.serialize(el))
            multi.expire(getKey(el.id), getTTL(el))
        }
        await multi.exec()
    }

    return { write }
}