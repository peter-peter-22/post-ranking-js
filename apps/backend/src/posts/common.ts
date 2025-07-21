import { getTableColumns, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { posts } from "../db/schema/posts"
import { PersonalPost } from "./hydratePosts"

/** The type of the post candidate. */
export const CandidateSourceSchema = z.enum(["Followed", "RepliedByFollowed", "GraphClusters", "EmbeddingSimilarity", "Trending", "Rest", "Publisher", "Unknown"])

export type CandidateSource = z.infer<typeof CandidateSourceSchema>

/** Post id with candidate source. */
export const PostCandidateSchema = z.object({
    id: z.string(),
    source: CandidateSourceSchema.optional(),
    score: z.number().optional(),
})

export type PostCandidate = z.infer<typeof PostCandidateSchema>

/** A candidate selector subquery. */
export const exampleCandiadteQuery = db.select(candidateColumns("Unknown")).from(posts).$dynamic()
export type CandidateSubquery = typeof exampleCandiadteQuery

/** The columns those are selected from the post candidates. @todo reuse values of candidate selectors*/
export function candidateColumns(candidateType: CandidateSource) {
    return {
        ...getTableColumns(posts),
        source: sql<CandidateSource>`${candidateType}::string`.as("candidate_type"),
    }
}

/** Count the number of posts per candidate source. */
export function countCandidateSources(posts: PostCandidate[]) {
    const candidateSourceCounts = new Map<CandidateSource, number>();
    posts.forEach(post => {
        const source = post.source || "Unknown"
        const count = candidateSourceCounts.get(source) || 0
        candidateSourceCounts.set(source, count + 1)
    })
    return candidateSourceCounts
}

export const BasicFeedSchema = z.object({
    offset: z.number().default(0)
})

export type DatePageParams = {
    skipStart: string,
    skipEnd: string
}

export type SingleDatePageParams = {
    maxDate: string
}

/** Merge the contents of arrays of posts where the arrays can be undefined */
export function mergePostArrays(postArrays: (PersonalPost[] | undefined)[]) {
    const total: PersonalPost[] = []
    postArrays.forEach(postArray => {
        if (postArray) total.push(...postArray)
    })
    return total
}


/** Remove posts with duplicated ids. */
export function deduplicatePosts(posts: PersonalPost[]) {
    const seen = new Set<string>();
    const deduplicated = posts.filter(post => {
        if (seen.has(post.id))
            return false;
        else {
            seen.add(post.id);
            return true;
        }
    })
    console.log("Before deduplication:", countCandidateSources(posts), "After deduplication:", countCandidateSources(deduplicated))
    return deduplicated
}