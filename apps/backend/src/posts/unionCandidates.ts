import { CandidateSubquery } from "./common"

export function unionCandidates(candidateSqs: CandidateSubquery[]) {
    // Throw if no candidate selectors
    if (candidateSqs.length === 0) {
        throw new Error("No candidate selectors provided")
    }

    // Union the subqueries
    let unionSq = candidateSqs[0]
    for (const sq of candidateSqs.slice(1))
        unionSq = unionSq.union(sq).$dynamic()

    return unionSq 
}
