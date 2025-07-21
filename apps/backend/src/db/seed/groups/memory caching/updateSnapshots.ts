import { db } from "../../..";
import { Engagement } from "../../../../bots/getEngagements";
import { chunkedInsert } from "../../../utils/chunkedInsert";
import { EngagementHistory } from "../../../schema/engagementHistory";
import { EngagementHistoryShapshotToInsert, engagementHistorySnapshots } from "../../../schema/engagementHistorySnapshots";
import { FollowToInsert } from "../../../schema/follows";
import { FollowShapshotToInsert, followSnapshots } from "../../../schema/followSnapshots";
import { postSnapshots, PostSnapshotToInsert } from "../../../schema/postSnapshots";
import { userEmbeddingSnapshots, UserEmbeddingSnapshotToInsert } from "../../../schema/userEmbeddingSnapshots";
import { PostEngagementCounts } from "./postEngagements";

/** Create post snapshots from the posts in the memory.
 * @param engagementCounts - The engagements of the posts at the moment.
 * @param engagements - The engagements in the batch. Used for deciding which posts are updated.
 * @param date - The date of the snapshot.
 */
export async function updatePostSnapshots(engagementCounts: PostEngagementCounts[], engagements:Engagement[], date: Date) {
    // Get the updated posts based on the engagements
    const updatedPostIds:Set<string>=new Set(engagements.map(engagement=>engagement.post.id))

    // Filter out the not updated posts
    engagementCounts=engagementCounts.filter(([postId,_])=>updatedPostIds.has(postId))

    // If no updates, exit
    if(engagementCounts.length===0)
        return

    // Insert
    await chunkedInsert(
        engagementCounts,
        async (batchEngagementCounts) => {
            await db
                .insert(postSnapshots)
                .values(
                    batchEngagementCounts.map(([id, counts]): PostSnapshotToInsert => ({
                        postId: id,
                        likeCount: counts.likes,
                        replyCount: counts.replies,
                        clickCount: counts.clicks,
                        viewCount: counts.views,
                        createdAt: date
                    }))
                )
        }
    )
    console.log(`Created ${engagementCounts.length} post snapshots.`)
}

/** Create snapshots for the engagement histories in the memory.
 * @param engagementHistories - The engagements histories at the moment.
 * @param date - The date of the snapshot.
 */
export async function updateHistorySnapshots(engagementHistories: EngagementHistory[], engagements:Engagement[], date: Date) {
    // Get the updated engagement histories
    const updatedHistorises:Map<string,Set<string>>=new Map()
    engagements.map(engagement=>{
        // Get or create the histories of the viewer
        let viewerHistories=updatedHistorises.get(engagement.user.id)
        if(!viewerHistories){
            viewerHistories=new Set()
            updatedHistorises.set(engagement.user.id,viewerHistories)
        }
        // Add the engaged poster
        viewerHistories.add(engagement.post.userId)
    })

    // Filter out the not updated histories
    engagementHistories=engagementHistories.filter(history=>{
        const viewerHistory=updatedHistorises.get(history.viewerId)
        if(!viewerHistory)
            return false
        return viewerHistory.has(history.publisherId)
    })

    // If no updates, exit
    if (engagementHistories.length === 0)
        return

    // Insert
    await chunkedInsert(
        engagementHistories,
        async (batchEngagementHistories) => {
            await db
                .insert(engagementHistorySnapshots)
                .values(
                    batchEngagementHistories.map((history: EngagementHistory): EngagementHistoryShapshotToInsert => ({
                        viewerId: history.viewerId,
                        posterId: history.publisherId,
                        likeCount: history.likes,
                        replyCount: history.replies,
                        clickCount: history.clicks,
                        createdAt: date
                    }))
                )
        }
    )

    console.log(`Created ${engagementHistories.length} engagement history snapshots.`)
}

/** Create snapshots for the follows in the memory.
 * @param follows - The follows at the moment.
 */
export async function updateFollowSnapshots(follows: FollowToInsert[]) {
    if (follows.length === 0)
        return

    await chunkedInsert(
        follows,
        async (batchFollows: FollowToInsert[]) => {
            await db
                .insert(followSnapshots)
                .values(
                    batchFollows.map((follow: FollowToInsert): FollowShapshotToInsert => ({
                        followerId: follow.followerId,
                        followedId: follow.followedId,
                        isFollowing: true,
                        createdAt:new Date(0) // Make sure the follow snapshot was created before anything else 
                    }))
                )
        }
    )
}

/** Insert the provided user embedding vector snapshots to the databse.
 * @param snapshots - The user embedding vector snapshots to insert.
 */
export async function updateUserEmbeddingSnapshots(snapshots:UserEmbeddingSnapshotToInsert[]){
    await chunkedInsert(
        snapshots,
        async (batchSnapshots: UserEmbeddingSnapshotToInsert[]) => {
            await db.insert(userEmbeddingSnapshots).values(batchSnapshots)
        }
    )
    console.log(`Created ${snapshots.length} user embedding vector snapshot.`)
}
