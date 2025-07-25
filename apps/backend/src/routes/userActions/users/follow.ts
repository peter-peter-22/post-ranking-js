import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { setCachedFollow } from '../../../redis/users/follows';

const router = Router();

const FollowSchema = z.object({
    followedId: z.string()
})

router.post('/create', async (req: Request, res: Response) => {
    // Get body
    const { followedId } = FollowSchema.parse(req.body)
    // Authenticate
    const user = await authRequestStrict(req);
    // Create follow
    await setCachedFollow(user.id, followedId, true)
    res.sendStatus(200)
});

router.post('/remove', async (req: Request, res: Response) => {
    // Get body
    const { followedId } = FollowSchema.parse(req.body)
    // Authenticate
    const user = await authRequestStrict(req);
    // Create follow
    await setCachedFollow(user.id, followedId, false)
    res.sendStatus(200)
});

export default router;