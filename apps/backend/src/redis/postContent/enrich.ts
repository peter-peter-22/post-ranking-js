import { Post } from "../../db/schema/posts";
import { enrichUsers } from "../users/enrich";
import { cachedUsers } from "../users/read";

export async function enrichPosts(posts: Post[], viewerId?: string) {
    const [users] = await Promise.all([
        enrichUsers(posts.map((post) => post.userId), viewerId),
    ])
}

