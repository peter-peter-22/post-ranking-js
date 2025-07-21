import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { getWhoToFollow } from '../../../db/controllers/users/whoToFollow';
import { BasicFeedSchema } from '../../../posts/common';
import { usersPerRequest } from '../../../redis/userFeeds/common';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    // Authenticate
    const user = await authRequestStrict(req);
    // Get the top engaged unfollowed users
    const topUsers = await getWhoToFollow(user)
    // Return the users
    res.json({ users: topUsers })
});

router.post('/feed', async (req: Request, res: Response) => {
    // Authenticate
    const user = await authRequestStrict(req);
    // Get body
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get the top engaged unfollowed users
    const topUsers = await getWhoToFollow(user, usersPerRequest, offset)
    // Return the users
    res.json({ users: topUsers })
});

export default router;