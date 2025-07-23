import { redisClient } from "./connect";
import { HSetSchema, HSetValue, typedHSet } from "./typedHSet";

export function cachedBulkHSetRead<T extends HSetValue>({
    schema,
    getKey,
    ttlOnRead,
    ttlOnWrite,
    fallback
}: {
    schema: HSetSchema,
    getKey: (id: string) => string,
    ttlOnRead: number,
    ttlOnWrite: (data: T) => number
    fallback: (ids: string[]) => Promise<T[]>
}) {
    const mySchema = typedHSet<T>(schema)

    const fetch = async (ids: string[]) => {
        // Map the ids
        const idsMap = new Map<string, T | null>(ids.map(id => [id, null]))
        if (idsMap.size===0) return idsMap
        // Try to read from redis
        const multi = redisClient.multi()
        ids.forEach(id => {
            multi.hGetAll(getKey(id))
        })
        // Update expiration
        ids.forEach(id => {
            multi.expire(getKey(id), ttlOnRead)
        })
        const results = await multi.exec()
        // Format the results
        for (let i = 0; i < ids.length; i++) {
            const result = results[i] as Record<string, string> | null
            if (!result || Object.keys(result).length === 0) continue
            const post = mySchema.deserialize(result)
            idsMap.set(post.id, post)
        }
        // Fallback to the db if there are missing posts
        const missingIds = ids.filter(id => idsMap.get(id) === null)
        console.log(`Cache hit: ${ids.length - missingIds.length}, cache miss: ${missingIds.length}, total: ${ids.length}`)
        if (missingIds.length > 0) {
            // Fetch the missing posts from the db
            const newData = await fallback(missingIds)
            newData.forEach(post => {
                idsMap.set(post.id, post)
            })
            // Add the new posts to the cache
            const multi = redisClient.multi()
            newData.forEach(post => {
                const key = getKey(post.id)
                multi.hSet(
                    key,
                    mySchema.serialize(post)
                )
                // Keep the posts alive as long as they can appear on the main feed, otherwise they live for a shorter time when touched
                multi.expire(
                    key,
                    ttlOnWrite(post)
                )
            })
            await multi.exec()
            return idsMap
        }
        return idsMap
    }

    return { read: fetch, schema: mySchema }
}

