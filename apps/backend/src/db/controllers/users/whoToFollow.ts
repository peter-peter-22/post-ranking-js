import { and, desc, eq, notExists } from "drizzle-orm";
import { db } from "../..";
import { engagementHistory } from "../../schema/engagementHistory";
import { follows } from "../../schema/follows";
import { UserCommon, users } from "../../schema/users";
import { personalUserColumns } from "./getUser";
import { postProcessUsers } from "./postProcessUsers";

/** Get the top engaged but not followed users */
export async function getWhoToFollow(user: UserCommon,limit:number=3,offset:number=0) {
    return await postProcessUsers(
        await db
            .select(personalUserColumns(user.id))
            .from(engagementHistory)
            .where(and(
                eq(engagementHistory.viewerId, user.id),
                notExists(
                    db
                        .select()
                        .from(follows)
                        .where(and(
                            eq(follows.followerId, engagementHistory.viewerId),
                            eq(follows.followedId, engagementHistory.publisherId)
                        ))
                )
            ))
            .orderBy(desc(engagementHistory.likes))
            .innerJoin(users, eq(users.id, engagementHistory.publisherId))
            .offset(offset)
            .limit(limit)
    )
}