import { Router } from 'express';
import { seedBasics } from '../../../db/seed/groups/seedBasics';
import { seedEngagements } from '../../../db/seed/groups/seedEngagements';

const router = Router();

router.get("/basics", async (req, res) => {
    await seedBasics()
    res.sendStatus(200)
})

router.get("/engagements", async (req, res) => {
    await seedEngagements()
    res.sendStatus(200)
})

export default router;