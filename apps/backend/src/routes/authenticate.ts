import { AuthResponse, LoginSchema } from "@me/schemas/src/zod/createUser";
import { Request, Response, Router } from 'express';
import { authUserCommon } from '../authentication';
import { db } from '../db';
import { getTrends } from '../db/controllers/trends/getTrends';
import { getWhoToFollow } from '../db/controllers/users/whoToFollow';
import { userColumns, users } from '../db/schema/users';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const data = LoginSchema.parse(req.body)
    // Try to login
    let user = await authUserCommon(data.userHandle)
    // If the user doesn't exists, register
    if (!user) {
        user = (
            await db
                .insert(users)
                .values([{
                    handle: data.userHandle,
                    name: data.userHandle,
                }])
                .returning(userColumns)
        )[0]
    }
    // Get common data for the user
    const [whoToFollow, trends] = await Promise.all([
        getWhoToFollow(user),
        getTrends(user.clusterId)
    ])
    // Return the user
    res.json({ user, common: { whoToFollow, trends } } as AuthResponse);
});

export default router;