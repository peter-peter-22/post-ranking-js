/** Log the progress of Promise.all 
 * @param promises The array of promises to process.
 * @param logInterval The interval in milliseconds to log the progress.
 * @param onLog The function to call to log the progress.
 * @returns The result of the Promise.all.
*/
export async function promisesAllTracked(promises: Promise<any>[], logInterval = 1000, onLog = (progress: number) => { console.log(Math.round(progress * 100) + "%") }): Promise<any[]> {
    let completed = 0;
    // Log the progress every logInterval milliseconds
    const logger = setInterval(() => { onLog(completed / promises.length) }, logInterval)
    const results = await Promise.all(
        promises.map(promise => promise.then(() => completed++))
    )
        .finally(() => clearInterval(logger))// Clear the interval when all at the end.
    return results
}