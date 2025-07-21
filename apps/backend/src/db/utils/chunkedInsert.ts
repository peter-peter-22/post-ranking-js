/** Execute database queries in batches to prevent errors.
 * @param data Array of rows to insert.
 * @param callback Callback to execute on each batch.
 * @param batchSize Number of rows per batch.
 * @returns The rows returned by the query.
*/
export async function chunkedInsert<T, Return>(data: T[], callback: (rows: T[]) => Promise<Return>, batchSize = 500): Promise<Return[]> {
    const chunkCount = Math.ceil(data.length / batchSize)
    const promises = Array.from({ length: chunkCount }).map((_, i) => {
        const chunk = data.slice(i * batchSize, (i + 1) * batchSize - 1)
        return callback(chunk)
    })
    const results: Return[] = []
    for (const promise of promises)
        results.push(await promise)
    return results
}