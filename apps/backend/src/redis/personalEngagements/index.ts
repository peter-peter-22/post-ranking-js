import { Post } from "../../db/schema/posts"
import { cachedBulkExistenceCheck } from "../bulkExistenceRead"
import { userPersonalTTL } from "../common"

export function cachedPersonalEngagements({
    getKey,
    fallback,
}: {
    getKey: (postId: string, userId: string) => string,
    fallback: (ids: string[], userId: string) => Promise<Set<string>>,
}) {
    const get = async (ids: string[], userId: string, posts: Map<string, Post>) => (
        await cachedBulkExistenceCheck({
            getKey: (id: string) => getKey(id, userId),
            fallback: (ids: string[]) => fallback(ids, userId),
            getTTL: ()=>userPersonalTTL,
        }).read(ids)
    )

    return { get }
}