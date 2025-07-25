import { postProcessUsers } from "../db/controllers/users/postProcessUsers";
import { PersonalPost } from "./hydratePosts";

/** Apply changes to the fetched posts before sending them to the client.
 ** Hide the contents of the deleted posts.
  */
export async function postProcessPosts(posts: PersonalPost[]) {
    if (posts.length === 0) return posts
    posts.forEach(post => {
        if (post.deleted) {
            post.text = null
            post.media = null
        }
    })
    await Promise.all([
        postProcessUsers(posts.map(p => p.user))//TODO this can be deduplicated
    ])
    return posts
}
