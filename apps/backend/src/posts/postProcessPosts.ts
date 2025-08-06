import { PersonalPost } from "@me/schemas/src/zod/post"

/** Apply changes to the fetched posts before sending them to the client.
 ** Hide the contents of the deleted posts.
  */
export function postProcessPosts(posts: PersonalPost[]) {
    // Hide the contents of the deleted posts
    posts.forEach(post => {
        if (post.deleted) {
            post.text = null
            post.media = null
        }
    })
    return posts
}
