import { UserCommon } from "../db/schema/users"
import { HttpError } from "../middlewares/errorHandler"
import { redisClient } from "./connect"

export async function getPaginatedData<TPageParams,TData>({
    getMore,
    feedName,
    user,
    offset,
    ttl
}: {
    getMore: (pageParams?: TPageParams) => Promise<{ data: TData, pageParams?: TPageParams } | undefined>,
    feedName: string,
    user: UserCommon,
    offset: number,
    ttl: number
}) {
    console.log(`Requested direct data feed "${feedName}" for user "${user.id}", offset: ${offset}`)
    const key = `${feedName}/${user.id}`
    // Get the page params
    const pageParams = await getPageParams<TPageParams>(key, ttl, offset)
    // Get the posts for this page
    const res = await getMore(pageParams)
    if (!res) return []
    const { data, pageParams: newPageParams } = res
    // Update the pageParams
    if (newPageParams)
        await redisClient.setEx(key, ttl, JSON.stringify(newPageParams))
    else
        await redisClient.del(key)
    // Return the posts
    return data
}

async function getPageParams<TPageParams>(key: string, ttl: number, offset: number) {
    // The first page has no page params
    if (offset === 0) return
    // Get the page params from redis
    const data_ = await redisClient.getEx(key, { EX: ttl })
    if (!data_) throw new HttpError(400, "Feed expired")
    // Parse the returned data
    return JSON.parse(data_ as string) as TPageParams
}