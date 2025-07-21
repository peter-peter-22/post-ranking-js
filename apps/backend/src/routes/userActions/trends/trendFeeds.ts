import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { TrendForClient } from '../../../db/controllers/trends/getTrends';
import { globalTrendFeed, personalTrendFeed, TrendPostCountPageParams, TrendPostScorePageParams } from '../../../db/controllers/trends/trendFeeds';
import { BasicFeedSchema } from '../../../posts/common';
import { getPaginatedData } from '../../../redis/pagination';
import { userFeedTTL } from '../../../redis/userFeeds/common';

const router = Router();

router.post('/global', async (req: Request, res: Response) => {
    // Get params
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get the user
    const viewer = await authRequestStrict(req)
    // Get the trends
    const trends = await getPaginatedData<TrendPostScorePageParams, TrendForClient[]>({
        getMore: async (pageParams) => await globalTrendFeed({ pageParams, offset }),
        feedName: `trends/global`,
        user: viewer,
        offset,
        ttl: userFeedTTL
    })
    res.json({ trends })
});

router.post('/personal', async (req: Request, res: Response) => {
    // Get params
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get the user
    const viewer = await authRequestStrict(req)
    // Get the trends
    const trends = await getPaginatedData<TrendPostCountPageParams, TrendForClient[]>({
        getMore: async (pageParams) => await personalTrendFeed({ pageParams, offset, user: viewer }),
        feedName: `trends/personal`,
        user: viewer,
        offset,
        ttl: userFeedTTL
    });
    res.json({ trends })
});

export default router;