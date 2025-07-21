import axios from "axios";
import { env } from "../../../zod/env";
import { z } from "zod";
import { embeddingVector } from "../../../zod/common/embeddingVector";

// Create axios instance for the embedding api
const embeddingApi = axios.create({
    baseURL: env.EMBEDDING_API_URL,
})

// Define the schema for the response
const embeddingResponse = z.object({
    embeddings: z.array(embeddingVector),
    keywords: z.array(z.array(z.string())),
})

/** Convert texts to embedding vectors via the embedding vector server.
 * @param texts The texts to convert.
 * @returns Embedding vectors and keywords.
 */
export async function generateEmbeddingVectors(texts: string[]) {
    try {
        const res = await embeddingApi.post("/embedding", { texts: texts })
        return embeddingResponse.parse(res.data)
    }
    catch (err) {
        throw new Error(`Failed to generate embedding vectors. Error: "${err instanceof Error ? err.message : err}"`)
    }
}