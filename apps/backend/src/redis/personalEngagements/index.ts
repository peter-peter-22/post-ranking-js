import { Post } from "../../db/schema/posts"
import { cachedBulkExistenceCheck } from "../bulkExistenceRead"
import { getMainFeedTTL, userTTL } from "../common"

export function getPersonalEngagementTTL(id: string, posts: Map<string, Post>) {
    const post = posts.get(id)
    if (!post) return userTTL
    return getMainFeedTTL(post.createdAt, userTTL)
}

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
            getTTL: (id: string) => getPersonalEngagementTTL(id, posts),
        }).read(ids)
    )

    return { get }
}