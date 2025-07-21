/** A url that leads to the posts of a trend. */
export function getTrendUrl(trendName: string) {
    return `/search?text=${trendName}`
}