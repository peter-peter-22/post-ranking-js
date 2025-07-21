const timeBucketInterval = 1000 * 60 * 60 * 12

/** Convert a date to a timebucket. */
export function getTimeBucket(date: Date) {
    return Math.floor(date.getTime() / timeBucketInterval)
}

/** Get a series of timebuckets between two dates.*/
export function getTimeBuckets(from: Date, to: Date, fromInclusive: boolean, toInclusive: boolean): number[] {
    const buckets: number[] = []
    const fromBucket = fromInclusive ? getTimeBucket(from) : getTimeBucket(from) + 1
    const toBucket = toInclusive ? getTimeBucket(to) : getTimeBucket(to) - 1
    for (let i = fromBucket; i <= toBucket; i++) {
        buckets.push(i)
    }
    return buckets
}