import { and, eq, exists, sql } from "drizzle-orm";
import { db } from "../..";
import { follows } from "../../schema/follows";
import { userColumns, users } from "../../schema/users";

/** The columns of the users those will be displayed in the client. */
export function personalUserColumns(viewerId?: string) {
    // Followed by viewer
    const isFollowedSq = (viewerId ? (
        exists(db
            .select()
            .from(follows)
            .where(and(
                eq(follows.followerId, viewerId),
                eq(follows.followedId, users.id)
            )))
    ) : (
        sql<boolean>`false::boolean`
    )).as<boolean>("followed_by_viewer")

    return ({
        ...userColumns,
        followed: isFollowedSq
    })
}

const exampleUserQuery=db.select(personalUserColumns()).from(users)

export type PersonalUser=Awaited<typeof exampleUserQuery>[number]