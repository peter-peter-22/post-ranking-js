import { Request, Response, Router } from 'express';
import { updateUserClusters } from '../../db/controllers/clusters/updateClusters';
import { updateTrends } from '../../db/controllers/trends/updateTrends';

const router = Router();

router.get('/userClusters', async (req: Request, res: Response) => {
    await updateUserClusters()
    res.sendStatus(200)
});

router.get('/trends', async (req: Request, res: Response) => {
    await updateTrends()
    res.sendStatus(200)
});

router.get('/clusterTrends', async (req: Request, res: Response) => {
    await updateUserClusters()
    res.sendStatus(200)
});

export default router;