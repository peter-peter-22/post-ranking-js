import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema } from '../../../posts/common';
import { ForYouPageParams, getMainFeed } from '../../../posts/forYou';
import { getPaginatedRankedPosts } from '../../../redis/postFeeds/rankedPosts';
import { postProcessPosts } from '../../../posts/postProcessPosts';
import { FollowedPostsPageParams, getFollowedFeed } from '../../../posts/followed';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { offset } = BasicFeedSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const posts = await postProcessPosts(
        await getPaginatedRankedPosts({
            getMore: async (pageParams?: ForYouPageParams) => await getMainFeed({ user, pageParams, offset }),
            feedName: "foryou",
            user,
            offset
        })
    )
    res.json({ posts })
});

router.post('/followed', async (req: Request, res: Response) => {
    const { offset } = BasicFeedSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const posts = await postProcessPosts(
        await getPaginatedRankedPosts({
            getMore: async (pageParams?: FollowedPostsPageParams) => await getFollowedFeed({ user, pageParams, offset }),
            feedName: "followed",
            user,
            offset
        })
    )
    res.json({ posts })
});

export default router;