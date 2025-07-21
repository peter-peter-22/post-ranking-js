import { Request, Response, Router } from 'express';
import { URLSearchParams } from 'url';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema, SingleDatePageParams } from '../../../posts/common';
import { PersonalPost } from '../../../posts/hydratePosts';
import { searchLatestPosts, searchTopPosts, TopPostsPageParam } from '../../../posts/search';
import { getPaginatedData } from '../../../redis/pagination';
import { postFeedTTL } from '../../../redis/postFeeds/common';
import { postProcessPosts } from '../../../posts/postProcessPosts';

const router = Router();

const SearchSchema = z.object({
    text: z.string().trim().optional(),
    userHandle: z.string().optional(),
})

router.post('/latest', async (req: Request, res: Response) => {
    // Get params
    const query = SearchSchema.parse(req.query)
    const { text, userHandle } = query
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await postProcessPosts(
        await getPaginatedData<SingleDatePageParams, PersonalPost[]>({
            getMore: async (pageParams) => await searchLatestPosts({ user, filterUserHandle: userHandle, offset, pageParams, text }),
            feedName: `searchPosts/latest/${new URLSearchParams(query).toString()}`,
            user,
            offset,
            ttl: postFeedTTL
        })
    )
    res.json({ posts })
});

router.post('/top', async (req: Request, res: Response) => {
    // Get params
    const query = SearchSchema.parse(req.query)
    const { text, userHandle } = query
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await postProcessPosts(
        await getPaginatedData<TopPostsPageParam, PersonalPost[]>({
            getMore: async (pageParams) => await searchTopPosts({ user, filterUserHandle: userHandle, offset, pageParams, text }),
            feedName: `searchPosts/top/${new URLSearchParams(query).toString()}`,
            user,
            offset,
            ttl: postFeedTTL
        })
    )
    res.json({ posts })
});

export default router;