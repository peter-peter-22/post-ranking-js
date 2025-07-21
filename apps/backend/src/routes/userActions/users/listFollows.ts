import { and, desc, eq, lt } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { PersonalUser, personalUserColumns } from '../../../db/controllers/users/getUser';
import { postProcessUsers } from '../../../db/controllers/users/postProcessUsers';
import { follows } from '../../../db/schema/follows';
import { userColumns, UserCommon, users } from '../../../db/schema/users';
import { HttpError } from '../../../middlewares/errorHandler';
import { BasicFeedSchema, SingleDatePageParams } from '../../../posts/common';
import { getPaginatedData } from '../../../redis/pagination';
import { userFeedTTL } from '../../../redis/userFeeds/common';

const router = Router();

const ListFollowsSchema = z.object({
    userHandle: z.string()
})

router.post('/followers/:userHandle', async (req: Request, res: Response) => {
    // Get params
    const { userHandle } = ListFollowsSchema.parse(req.params)
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get users
    const [viewer, targetUser] = await Promise.all([
        authRequestStrict(req),
        getTargetUser(userHandle)
    ])
    // Get users
    const users = await getPaginatedData<SingleDatePageParams, PersonalUser[]>({
        getMore: async (pageParams) => await listFollowers({ pageParams, offset, targetUserId: targetUser.id, viewer: viewer }),
        feedName: `users/followers/${targetUser.id}`,
        user: viewer,
        offset,
        ttl: userFeedTTL
    });
    res.json({ users })
});

async function listFollowers({
    offset,
    targetUserId,
    viewer,
    pageParams
}: {
    offset?: number,
    targetUserId: string,
    viewer: UserCommon,
    pageParams?: SingleDatePageParams
}) {
    if (offset !== 0 && !pageParams) return

    const fetchedUsers = await db
        .select(personalUserColumns(viewer.id))
        .from(follows)
        .where(and(
            eq(follows.followedId, targetUserId),
            pageParams && lt(follows.createdAt, new Date(pageParams?.maxDate))
        ))
        .innerJoin(users, eq(users.id, follows.followerId))
        .orderBy(desc(follows.createdAt));

    if (fetchedUsers.length === 0) return

    const newPageParams: SingleDatePageParams = {
        maxDate: fetchedUsers[fetchedUsers.length - 1].createdAt.toISOString()
    }

    return { data: fetchedUsers, pageParams: newPageParams }
}

router.post('/followed/:userHandle', async (req: Request, res: Response) => {
    // Get params
    const { userHandle } = ListFollowsSchema.parse(req.params)
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get users
    const [viewer, targetUser] = await Promise.all([
        authRequestStrict(req),
        getTargetUser(userHandle)
    ])
    // Get users
    const users = await postProcessUsers(
        await getPaginatedData<SingleDatePageParams, PersonalUser[]>({
            getMore: async (pageParams) => await listFollowed({ pageParams, offset, targetUserId: targetUser.id, viewer }),
            feedName: `users/followers/${targetUser.id}`,
            user: viewer,
            offset,
            ttl: userFeedTTL
        })
    )
    res.json({ users })
});

async function listFollowed({
    offset,
    targetUserId,
    viewer,
    pageParams
}: {
    offset?: number,
    targetUserId: string,
    viewer: UserCommon,
    pageParams?: SingleDatePageParams
}) {
    if (offset !== 0 && !pageParams) return

    const fetchedUsers = await db
        .select(personalUserColumns(viewer.id))
        .from(follows)
        .where(and(
            eq(follows.followerId, targetUserId),
            pageParams && lt(follows.createdAt, new Date(pageParams?.maxDate))
        ))
        .innerJoin(users, eq(users.id, follows.followedId))
        .orderBy(desc(follows.createdAt));

    if (fetchedUsers.length === 0) return

    const newPageParams: SingleDatePageParams = {
        maxDate: fetchedUsers[fetchedUsers.length - 1].createdAt.toISOString()
    }

    return { data: fetchedUsers, pageParams: newPageParams }
}

async function getTargetUser(userHandle: string) {
    const user = (
        await db.select(userColumns).from(users).where(eq(users.handle, userHandle))
    )[0]
    if (!user) throw new HttpError(404, "User not found")
    return user
}

export default router;