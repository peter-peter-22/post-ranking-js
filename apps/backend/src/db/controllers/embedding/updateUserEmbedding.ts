import { and, desc, eq } from "drizzle-orm";
import { db } from "../..";
import { likes } from "../../schema/likes";
import { posts } from "../../schema/posts";
import { User, users } from "../../schema/users";
import { isPost } from "../../../posts/filters";
import { normalizeVector } from "../../../utilities/arrays/normalize";

/** The max count of total engagements those affect the embedding vector. */
export const maxUserEmbeddingHistory = 1000;

export type Vector = number[]

/** Update the embedding vector of a user. 
 * @param user The user to update.
*/
export async function updateUserEmbeddingVector(user: User) {
    // Get the vectors and their weights.
    const vectors = await getEngagementEmbeddingVectors(user)

    //if the used did not made any engagement yet, exit
    if (vectors.length === 0)
        return

    // Calculate the average.
    const userEmbeddingVector = averageVector(vectors)

    // Update the vector of the user.
    await db
        .update(users)
        .set({
            embedding: userEmbeddingVector,
            embeddingNormalized: userEmbeddingVector ? normalizeVector(userEmbeddingVector) : null
        })
        .where(eq(users.id, user.id))
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
async function getEngagementEmbeddingVectors(user: User): Promise<Vector[]> {
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
                    eq(likes.userId, user.id)
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