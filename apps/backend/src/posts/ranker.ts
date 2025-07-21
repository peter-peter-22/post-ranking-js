import axios from "axios";
import { z } from "zod";
import { env } from "../zod/env";
import { PersonalPost } from "./hydratePosts";

/** Axios instance to communicate with the ranker api */
const rankerApi = axios.create({
    baseURL: env.RANKER_API_URL
})

/** The format of data the ranker api expects */
type PostToRank = {
    age: number,
    like_count: number,
    reply_count: number,
    click_count: number,
    embedding_similarity: number,
    like_history: number,
    reply_history: number,
    click_history: number,
    followed: boolean,
    replied_by_followed: boolean
}

/** Response of the ranker api. */
const rankerResponeSchema = z.object({
    scores: z.array(z.number())
})

/** Use the ranker api to score the post then order them. */
export async function rankPosts(posts: PersonalPost[]): Promise<PersonalPost[]> {
    try {
        if (posts.length === 0) {
            console.log("No posts to rank")
            return []
        }
        // Format the posts for the ranker
        const rankerInputs: PostToRank[] = posts.map((post) => ({
            age: (Date.now() - post.createdAt.getTime()) / 1000 / 60 / 60, // age in hours
            like_count: post.likes,
            reply_count: post.replies,
            click_count: post.clicks,
            embedding_similarity: post.similarity,
            like_history: post.engagementHistory?.likes || 0,
            reply_history: post.engagementHistory?.replies || 0,
            click_history: post.engagementHistory?.clicks || 0,
            followed: post.user.followed,
            replied_by_followed: post.repliedByFollowed
        }))
        // Fetch the post scores
        const res = await rankerApi.post("/rank", { posts: rankerInputs })
        // Validate response
        const { scores } = rankerResponeSchema.parse(res.data)
        // Add the scores to the posts
        let scoredPosts = posts.map((post, i) => ({ ...post, score: scores[i] }))
        // Order the posts by score
        scoredPosts = scoredPosts.sort((a, b) => b.score - a.score)
        return scoredPosts
    }
    catch (e) {
        console.error(e)
        throw new Error("Failed to rank posts")
    }
}