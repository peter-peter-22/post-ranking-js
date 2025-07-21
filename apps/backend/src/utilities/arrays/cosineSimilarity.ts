import { dot, norm } from 'mathjs';

/**
 * Calculates the cosine similarity between two vectors
 * @param a First vector as number[]
 * @param b Second vector as number[]
 * @returns Cosine similarity score between -1 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }

    const dotProduct: number = dot(a, b) as number;
    const magnitudeA: number = norm(a) as number;
    const magnitudeB: number = norm(b) as number;
    
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
}