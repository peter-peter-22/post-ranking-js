import { RedisMulti } from "./common";
import { redisClient } from "./connect";
import { HSetValue, TypedHSetHandler } from "./typedHSet";

export function cachedHset<T extends HSetValue>({
    schema,
    getKey,
    generate,
    getId,
    onRead
}: {
    schema: TypedHSetHandler<T>,
    getKey: (id: string) => string,
    getId: (value: T) => string,
    generate: (ids: string[], schema: TypedHSetHandler<T>) => Promise<T[]>,
    onRead?: (values: Map<string, T | undefined>) => Promise<void>
}) {

    const read = async (ids: string[]) => {
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
            const newData = await generate(missingIds, schema)
            const dataMap = new Map<string, T>(newData.map(row => [getId(row), row]))
            // Add to the results
            for (const id of missingIds) {
                const data = dataMap.get(id)
                resultMap.set(id, data)
            }
        }
        // Post process the results if needed
        if (onRead) await onRead(resultMap)
        return resultMap
    }

    const readAsArray = async (ids: string[]) => {
        return [...(await read(ids)).values()]
    }

    const readSingle = async (id: string) => {
        return (await readAsArray([id]))[0]
    }

    const update = async (updates: { key: string, values: Partial<T> }[], multi: RedisMulti) => {
        for (const { key, values } of updates) {
            multi.hSet(key, schema.serializePartial(values))
        }
    }

    return { read, readAsArray, readSingle, update }
}