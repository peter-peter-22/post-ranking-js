import { asc, desc } from "drizzle-orm"
import { db } from ".."
import { createPosts } from "../../userActions/posts/createPost"
import { posts, PostToCreate } from "../schema/posts"
import { User, UserCommon } from "../schema/users"

/** Returns the date range where the posts are created. */
export async function getTimeIntervalOfPosts() {
    const [[newest], [oldest]] = await Promise.all([
        db.select().from(posts).orderBy(desc(posts.createdAt)).limit(1),
        db.select().from(posts).orderBy(asc(posts.createdAt)).limit(1)
    ])

    return { newest: newest.createdAt, oldest: oldest.createdAt }
}

export async function createPostsBetweenDates({ from, to, count, user, createPost: postCreator }: { from: Date, to: Date, count: number, user: UserCommon, createPost: (user: UserCommon) => PostToCreate }) {
    /**Dates from the creation of the oldest post to the creation of the newest post */
    const postDates = Array.from({ length: 5 }).map((_, i) => {
        const t = i / (count - 1);
        return to.getTime() + (from.getTime() - to.getTime()) * t
    })

    /**The posts created by the followed user */
    const postsToInsert: PostToCreate[] = postDates.map(date => ({
        ...postCreator(user),
        createdAt: new Date(date)
    }))

    console.log(`Created ${postsToInsert.length} posts in the time interval.`)

    return await createPosts(postsToInsert)
}