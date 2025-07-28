import { and, desc, eq } from "drizzle-orm";
import { db } from "../..";
import { isPost } from "../../../posts/filters";
import { normalizeVector } from "../../../utilities/arrays/normalize";
import { likes } from "../../schema/likes";
import { posts } from "../../schema/posts";
import { userEmbeddingSnapshots } from "../../schema/userEmbeddingSnapshots";
import { users } from "../../schema/users";

/** The max count of total engagements those affect the embedding vector. */
const maxUserEmbeddingHistory = 1000;
/** Minimum count of engagements to assign a vector to the user. */
const minEmbeddingHistory = 5

export type Vector = number[]

export async function recalculateUserEmbeddingVector(userId: string) {
    // Get the vectors and their weights.
    const vectors = await getEngagementEmbeddingVectors(userId)

    //if the used did not made any engagement yet, exit
    if (vectors.length < minEmbeddingHistory)
        return

    // Calculate the average.
    const userEmbeddingVector = averageVector(vectors)

    // Update the vector of the user.
    const [updated] = await db
        .update(users)
        .set({
            embedding: userEmbeddingVector,
            embeddingNormalized: userEmbeddingVector ? normalizeVector(userEmbeddingVector) : null
        })
        .where(eq(users.id, userId))
        .returning({ vector: users.embeddingNormalized })
        
    // Create snapshot
    if (updated?.vector)
        await db
            .insert(userEmbeddingSnapshots)
            .values({
                userId: userId,
                embedding: updated.vector
            })
}

/** Calculate the average of an array of vectors.
 * @param vectors The vectors.
 * @returns The average vector.
 */
export function averageVector(vectors: Vector[]): Vector | null {
    // If no vectors, return null
    if (vectors.length === 0)
        return null
    // Calculate the average of each dimension
    return vectors[0].map((_, dim) =>
        vectors.reduce((sum, vector) => sum + vector[dim], 0) / vectors.length
    );
}

/** Get the embedding vectors from the posts those the user recently liked.
 * @param user The processed user.
 * @returns Array of embedding vectors.
 */
async function getEngagementEmbeddingVectors(userId: string): Promise<Vector[]> {
    // Select the liked post vectors 
    return (
        await db
            .select({
                embedding: posts.embeddingNormalized
            })
            .from(likes)
            .where(
                and(
                    isPost(),
                    eq(likes.userId, userId)
                )
            )
            .leftJoin(posts, eq(likes.postId, posts.id))
            .orderBy(desc(likes.createdAt))
            .limit(maxUserEmbeddingHistory)
    )
        // Convert to vector
        .map((row): Vector | null => row.embedding)
        // Filter out nulls
        .filter((vector) => vector != null)
}