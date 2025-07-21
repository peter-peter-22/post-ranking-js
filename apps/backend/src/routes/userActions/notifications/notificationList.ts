import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { notificationList, notificationListMentions } from '../../../db/controllers/notifications/read';
import { BasicFeedSchema } from '../../../posts/common';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    // Get params
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const viewer = await authRequestStrict(req)
    // Get notifications
    const data = await notificationList(viewer.id, offset)
    res.json({ notifications: data })
});

router.post('/mentions', async (req: Request, res: Response) => {
    // Get params
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const viewer = await authRequestStrict(req)
    // Get notifications
    const data = await notificationListMentions(viewer.id, offset)
    res.json({ notifications: data })
});

export default router;