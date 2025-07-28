import { db } from "../../..";
import { followSnapshots } from "../../../schema/followSnapshots";

export async function createFollowSnapshot(followerId: string, followedId: string, value: boolean) {
    await db
        .insert(followSnapshots)
        .values({
            followedId: followedId,
            followerId: followerId,
            isFollowing: value
        })
}