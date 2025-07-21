import { redisClient } from "./connect";

/** Attempt to read a value from the cache. If not cached or expired, generate it.
 * @param key The identifier of the cached item.
 * @param generate The function that generates and returns the value.
 * @param expiration Cache lifespan in seconds.
 * @returns The cached or generated value.
 */
export async function getOrGenerateCache<T>(key: string, generate: () => Promise<T>, expiration:number): Promise<T> {
    // Check if the data is in Redis
    const cachedData = await redisClient.get(key);

    if (cachedData) {
        // If data is found in cache, parse and return it
        return JSON.parse(cachedData) as T;
    } else {
        // If data is not in cache, execute the query
        const result = await generate();

        // Cache the result in Redis with an expiration of x seconds
        await redisClient.setEx(key, expiration, JSON.stringify(result));

        // Return the result
        return result;
    }
}