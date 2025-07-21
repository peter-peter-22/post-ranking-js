import { getTableName } from "drizzle-orm";
import { db } from "../..";
import { Engagement, getEngagements, ViewerPublisherRelationship } from "../../../bots/getEngagements";
import { cosineSimilarity } from "../../../utilities/arrays/cosineSimilarity";
import { clearClusters } from "../../controllers/clusters/clear";
import { insertEngagements } from "../../controllers/posts/insertEngagement";
import { clearReplies } from "../../reset/clearReplies";
import { clearTables } from "../../reset/clearTables";
import { clicks } from "../../schema/clicks";
import { engagementHistory } from "../../schema/engagementHistory";
import { engagementHistorySnapshots } from "../../schema/engagementHistorySnapshots";
import { likes } from "../../schema/likes";
import { persistentDates } from "../../schema/persistentDates";
import { Post, posts } from "../../schema/posts";
import { postSnapshots } from "../../schema/postSnapshots";
import { trends } from "../../schema/trends";
import { userEmbeddingSnapshots } from "../../schema/userEmbeddingSnapshots";
import { User } from "../../schema/users";
import { views } from "../../schema/views";
import { getAllBots } from "../utils";
import { getEngagementHistoryCache } from "./memory caching/engagementHistory";
import { getFollowChecker } from "./memory caching/follows";
import { getEngagementCache } from "./memory caching/postEngagements";
import { getCommenterChecker } from "./memory caching/replies";
import { applyMemoryEngagementCounts, applyMemoryEngagementHistory, applyMemoryUserEmbeddingVectors } from "./memory caching/saveCounts";
import { updateHistorySnapshots, updatePostSnapshots, updateUserEmbeddingSnapshots } from "./memory caching/updateSnapshots";
import { userEmbeddingVectorHandler } from "./memory caching/userEmbeddingVectors";
import { isPost } from "../../../posts/filters";

type UserPostPair = [
  user: User,
  post: Post,
  timestamp: number
]

/**
 * Create random and organic engagements.
 */
export async function seedEngagements() {
  // Clear existing engagements, and other related tables.
  await clearTables([
    getTableName(likes),
    getTableName(views),
    getTableName(clicks),
    getTableName(trends),
    getTableName(persistentDates),
    getTableName(engagementHistory),
    getTableName(postSnapshots),
    getTableName(engagementHistorySnapshots),
    getTableName(userEmbeddingSnapshots)
  ])
  await clearReplies()
  await clearClusters()

  // Generate engagements
  await createEngagementsForPairs(await getUsersAndPosts())

  // Update engagement related tables.
  console.log("Updating engagement related tables")
  //await updateUserClusters()
  //await updateTrendsList()// TODO make this faster
  console.log("Seeded engagements")
}

/**
 * Create all kinds of organic engagements for the given user-post pairs.
 * @param pairs Array of user-post pairs.
 */
async function createEngagementsForPairs(pairs: UserPostPair[]) {
  console.log(`Creating engagements for ${pairs.length} pairs`)
  // Get the follow checker.
  const checkFollow = await getFollowChecker()
  // Get the engagement count cache.
  const engagementCounts = getEngagementCache()
  // Get the engagement history cache.
  const engagementHistories = getEngagementHistoryCache()
  // Get the commenter cache.
  const commenterChecker = getCommenterChecker()
  // Get the user embedding vector cache.
  const userVectors = userEmbeddingVectorHandler()
  /** The chance to view a post */
  const viewChance = 0.3
  // The number of the engagements those are processed together. 
  const batchSize = 100000;
  const batchCount = Math.ceil(pairs.length / batchSize)
  // Process the pairs
  for (let batch = 0; batch < batchCount; batch++) {
    console.log(`Processing batch ${batch + 1} of ${batchCount}`)
    // The user-post pairs inside the batch.
    const batchPairs = pairs.slice(batch * batchSize, (batch + 1) * batchSize)
    // The engagements created inside the batch.
    const batchEngagements: Engagement[] = []
    // Process the pairs, create their promises.
    batchPairs.map(async ([user, post, timestamp]) => {
      // Get if the user seen this post.
      const seen = Math.random() < viewChance
      if (!seen) return // Skip if the user didn't see the post.
      // Get the relationship between the viewer and the publisher.
      const userVector = userVectors.getAverage(user.id)
      const relationship: ViewerPublisherRelationship = {
        followed: checkFollow(user.id, post.userId),
        engagementHistory: engagementHistories.get(user.id, post.userId),
        repliedByFollowed: repliedByFollowed(post, user, checkFollow, commenterChecker.get),
        cosineSimilarity: userVector && post.embedding ? cosineSimilarity(userVector, post.embedding) : null
      }
      // Apply the engagement counts.
      engagementCounts.applyCounts(post)
      // Generate the engagements for the post.
      const engagements = getEngagements(user, post, relationship, new Date(timestamp))
      batchEngagements.push(engagements)
    })
    // Update the cached engagement counters.
    console.log("Updating counters...")
    engagementCounts.add(batchEngagements)
    engagementHistories.apply(batchEngagements)
    commenterChecker.update(batchEngagements)
    userVectors.apply(batchEngagements)
    console.log("Inserting and, updating snapshots...")
    /** The last date in the batch. */
    const updateDate = new Date(batchPairs[batchPairs.length - 1][2])
    await Promise.all([
      // Insert the engagements into the database.
      insertEngagements(batchEngagements),
      // Create snapshots of the current state of engagements.  
      updatePostSnapshots(engagementCounts.getAll(), batchEngagements, updateDate),
      updateHistorySnapshots(engagementHistories.getAll(), batchEngagements, updateDate),
      updateUserEmbeddingSnapshots(userVectors.getAllAverages(updateDate))
    ])
  }
  // Save the engagement counts in the memory to the database to save time.
  await Promise.all([
    applyMemoryEngagementCounts(engagementCounts.getAll()),
    applyMemoryEngagementHistory(engagementHistories.getAll()),
    applyMemoryUserEmbeddingVectors(userVectors.getAllAverages(new Date()))
  ])

}

/** Check if a post was replied by a user that is followed by the viewer.
 * @param post The post to check.
 * @param viewer The viewer.
 * @param checkFollow The function to check if a user follows another user.
 */
function repliedByFollowed(post: Post, viewer: User, checkFollow: (from: string, to: string) => boolean, commenterChecker: (postId: string) => Set<string> | undefined): boolean {
  // Get the comments of the post.
  const repliers = commenterChecker(post.id)
  if (!repliers) return false // No replies, return false.
  // Check if any of the commenters are followed by the viewer.
  for (const replier of repliers) {
    if (checkFollow(viewer.id, replier)) {
      return true
    }
  }
  // None of the commenters are followed by the viewer, return false.
  return false
}

/** 
* Get all user and post pairs in chronological order.
* @returns Array of pairs. 
*/
async function getUsersAndPosts(): Promise<UserPostPair[]> {
  console.log("Getting all users and posts")
  const allUsers = await getAllBots()
  const allPosts = await db.select().from(posts).where(isPost())
  console.log("Creating user and post pairs")
  // The oldest engagements will have this date.
  const maxDelay = 1 * 24 * 60 * 60 * 1000 // 1 day
  /** All users paired with all posts. */
  let pairs: UserPostPair[] = allUsers
    .flatMap((user) => allPosts.map((post) => [user, post, post.createdAt.getTime() + Math.random() * maxDelay] as UserPostPair))
    .sort((a, b) => a[2] - b[2]);//Sort by date, oldest first.

  return pairs
}