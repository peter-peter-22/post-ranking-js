import { db } from "..";
import { promisesAllTracked } from "../../utilities/arrays/trackedPromises";
import { updateAllFollowCounts } from "../controllers/users/follow/count";
import { follows, FollowToInsert } from "../schema/follows";
import { User } from "../schema/users";
import { chunkedInsert } from "../utils/chunkedInsert";
import { updateFollowSnapshots } from "./groups/memory caching/updateSnapshots";

/** Chance to follow when the follower is interested in a topic of the followable */
const chanceToFollowInterest = 0.3
/** Default chance to follow */
const chanceToFollowIrrelevant = 0.02

/**
 * Create organic follows between the users and insert them into the DB.
 * 
 * @param users all possibble followers
 * @param posts all possibble followeds
 * @returns array of follows
 */
async function createRandomFollows(from: User[], to: User[]) {
    console.log(`Creating follows. Max results: ${from.length * to.length}`)
    /** The total count of the inserted rows. */
    let count = 0
    /** The count of the rows the users whose follows are ready to insert. */
    let prepared = 0
    await promisesAllTracked(
        from.map(async (user) => {
            {
                // Create the follows
                const followsToInsert = createRandomFollowsForUser(user, to)
                // Track the count of the prepared users
                prepared++
                if (prepared % 100 === 0) console.log(`Prepared ${prepared}/${from.length} users`)
                // Track the total count
                count += followsToInsert.length
                // Insert the follows after creating them insted of inserting them later to avoid memory issues
                await chunkedInsert(followsToInsert, async data => {
                    await db.insert(follows)
                        .values(data)
                        .onConflictDoNothing();
                })
                // Update follow snapshots
                await updateFollowSnapshots(followsToInsert)
            }
        })
    )
    console.log(`Created ${count} follows`)
}

/**
 * Creates the organic follows of a selected user.
 * 
 * @param user the user who makes the follows
 * @param followables all followable users
 * @returns array of follows
 */
function createRandomFollowsForUser(user: User, followables: User[]): FollowToInsert[] {
    const follows: FollowToInsert[] = [];
    followables.forEach(followable => {
        /** true if the followable user has at least one topic the follower is interested about */
        const isInterested = user.interests.some(interest => followable.interests.includes(interest))
        const follow = Math.random() < (isInterested ? chanceToFollowInterest : chanceToFollowIrrelevant)
        if (follow)
            follows.push({
                followerId: user.id,
                followedId: followable.id
            })
    })
    return follows
}

export async function seedFollows({ from, to }: { from: User[], to: User[] }) {
    await createRandomFollows(from, to)
    await updateAllFollowCounts()
}