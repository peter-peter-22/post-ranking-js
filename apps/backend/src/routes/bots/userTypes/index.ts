import { Request, Response, Router } from 'express';
import { mainUserTypeNew } from '../../../db/seed/scenes/new';
import { testCommentRanker } from '../../../db/seed/scenes/commentRanking';
import { notificationTest } from '../../../db/seed/scenes/notificationTest';
import { authRequestStrict } from '../../../authentication';

const router = Router();

router.get('/new', async (req: Request, res: Response) => {
    await mainUserTypeNew()
    res.sendStatus(200)
});

router.get('/commentRanking', async (req: Request, res: Response) => {
    const id=await testCommentRanker()
    res.json({id})
});

router.get('/notificationTest', async (req: Request, res: Response) => {
    const user=await authRequestStrict(req)
    await notificationTest(user)
    res.sendStatus(200)
});

export default router;