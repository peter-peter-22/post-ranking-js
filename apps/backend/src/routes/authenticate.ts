import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authUserCommon } from '../authentication';
import { db } from '../db';
import { getTrends } from '../db/controllers/trends/getTrends';
import { getWhoToFollow } from '../db/controllers/users/whoToFollow';
import { userColumns, users } from '../db/schema/users';

const router = Router();

export const authSchema = z.object({
    handle: z
        .string()
        .regex(/^[a-z0-9_]+$/, {
            message: "Only letters, numbers, and underscores are allowed"
        })
        .max(50)
})

router.post('/', async (req: Request, res: Response) => {
    const data = authSchema.parse(req.body)
    // Try to login
    let user = await authUserCommon(data.handle)
    // If the user doesn't exists, register
    if (!user) {
        user = (
            await db
                .insert(users)
                .values([{
                    handle: data.handle,
                    name: data.handle,
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
    res.json({ user, common: { whoToFollow, trends } });
});

export default router;