import axios from "axios";

export type PostValues = {
  followed: boolean,
  replied_by_followed: boolean,
  like_count: number,
  reply_count: number,
  click_count: number,
  like_history: number,
  reply_history: number,
  click_history: number,
  age: number,
  embedding_similarity: number
}

const ranker = axios.create({
  baseURL: 'http://localhost:8002',
});

export type ScoreResponse = { score: number }

export async function getPostScore(values: PostValues): Promise<ScoreResponse> {
  try {
    const res = await ranker.post("/rank", { posts: [values] })
    return {
      score:res.data.scores[0]
    }
  }
  catch (err) {
    console.log(err)
    return {score:-1}
  }
}