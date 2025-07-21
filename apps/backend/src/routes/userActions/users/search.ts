import { Request, Response, Router } from 'express';
import { URLSearchParams } from 'url';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { PersonalUser } from '../../../db/controllers/users/getUser';
import { FollowerCountPageParams, userSearch } from '../../../db/controllers/users/search';
import { BasicFeedSchema } from '../../../posts/common';
import { getPaginatedData } from '../../../redis/pagination';
import { userFeedTTL } from '../../../redis/userFeeds/common';
import { postProcessUsers } from '../../../db/controllers/users/postProcessUsers';

const router = Router();

const SearchSchema = z.object({
    text: z.string().trim().optional(),
})

router.post('/', async (req: Request, res: Response) => {
    // Get params
    const query = SearchSchema.parse(req.query)
    const { text } = query
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get users
    const users = await postProcessUsers(
        await getPaginatedData<FollowerCountPageParams, PersonalUser[]>({
            getMore: async (pageParams) => await userSearch({ user, offset, pageParams, text }),
            feedName: `users/search/${new URLSearchParams(query).toString()}`,
            user,
            offset,
            ttl: userFeedTTL
        })
    )
    res.json({ users })
});

export default router;