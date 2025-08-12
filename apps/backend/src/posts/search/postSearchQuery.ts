import { and, eq, SQL, sql } from "drizzle-orm"
import { db } from "../../db"
import { posts } from "../../db/schema/posts"
import { postsPerRequest } from "../../redis/feeds/postFeeds/common"
import { noPending } from "../filters"

/** Query to full text search posts. */
export function postSearchQuery({
    text,
    filterUserHandle,
    filter
}: {
    text?: string,
    filterUserHandle?: string,
    filter?: SQL
}) {
    const q = db
        .select({id:posts.id})
        .from(posts)
        .where(and(
            noPending(),
            text ? sql`to_tsvector('english', ${posts.text}) @@  plainto_tsquery('english', ${text})` : undefined,
            filterUserHandle ? eq(posts.userId, filterUserHandle) : undefined,
            filter
        ))
        .limit(postsPerRequest)
        .$dynamic()
    return q
}