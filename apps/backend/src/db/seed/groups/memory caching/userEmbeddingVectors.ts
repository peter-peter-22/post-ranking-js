import { Engagement } from "../../../../bots/getEngagements";
import { averageVector, maxUserEmbeddingHistory, Vector } from "../../../controllers/embedding/updateUserEmbedding";
import { UserEmbeddingSnapshotToInsert } from "../../../schema/userEmbeddingSnapshots";

type UserVectorAndAverage = { vectors: Vector[], average: Vector | null, nextRecalculation: number }

/** Create functions to manage the embedding vectors of the users in the memory.
 * @returns Functions to get and update user embedding vectors.
 */
export function userEmbeddingVectorHandler() {
    const vectors: Map<string, UserVectorAndAverage> = new Map()
    // How much engagements can happen before the average vector cache is invalidated
    const cacheLife = 10

    /** Add engagements to the user embedding tracker.
     * @param engagements The engagements to add.
     */
    const apply = (engagements: Engagement[]) => {
        for (const engagement of engagements) {
            // If the engaged post is a reply, skip 
            if (engagement.post.replyingTo || !engagement.post.embedding)
                continue
            // Get the vector list of the user
            const userVectors = getOrCreate(engagement.user.id)
            // Append the new vector
            userVectors.vectors.push(engagement.post.embedding)
            // Invalidate cache when necessary
            userVectors.nextRecalculation--
            if (userVectors.nextRecalculation <= 0)
                userVectors.average = null
            // Limit the length of the vector list. The real user vector calculation also limits it.
            if (userVectors.vectors.length > maxUserEmbeddingHistory)
                userVectors.vectors.splice(0, userVectors.vectors.length - maxUserEmbeddingHistory)
        }
    }

    /** Get the average vector of the provided user. 
     * @param user The user id.
     * @returns The average vector of the user.
    */
    const getAverage = (user: string) => {
        const entry = getOrCreate(user)
        // Calculate cache if doesn't exists
        if (!entry.average) {
            const average = averageVector(entry.vectors)
            entry.average = average
            entry.nextRecalculation = cacheLife
        }
        // Return the cache
        return entry.average
    }

    /** Get all users and their average vectors. */
    const getAllAverages = (date: Date): UserEmbeddingSnapshotToInsert[] => {
        const results: UserEmbeddingSnapshotToInsert[] = []
        Array.from(vectors.keys()).forEach((userId) => {
            const vector = getAverage(userId)
            // Filter out empty vectors
            if (!vector) return
            results.push({
                userId,
                embedding: vector,
                createdAt: date
            })
        });
        return results
    }

    /** Get or create the engaged vector list of a user.
     * @param userId The user id to get the vector list of.
     * @returns The vector list and average vector of the user.
     */
    const getOrCreate = (userId: string) => {
        // Try to get
        const myVectors = vectors.get(userId)
        if (myVectors)
            return myVectors
        // If doent't exist create
        const newEntry: UserVectorAndAverage = { vectors: [], average: null, nextRecalculation: 0 }
        vectors.set(userId, newEntry)
        return newEntry
    }

    return {
        getAllAverages,
        apply,
        getAverage
    }
}