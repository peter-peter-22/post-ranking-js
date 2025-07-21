import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { CommentsPageParams, getReplies } from '../../../posts/comments/getReplies';
import { BasicFeedSchema } from '../../../posts/common';
import { PersonalPost } from '../../../posts/hydratePosts';
import { getPaginatedData } from '../../../redis/pagination';
import { postFeedTTL } from '../../../redis/postFeeds/common';
import { postProcessPosts } from '../../../posts/postProcessPosts';

const router = Router();

const CommentSectionUrlSchema = z.object({
    postId: z.string(),
})

router.post('/:postId', async (req: Request, res: Response) => {
    // Get params
    const { postId } = CommentSectionUrlSchema.parse(req.params)
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await postProcessPosts(
        await getPaginatedData<CommentsPageParams, PersonalPost[]>({
            getMore: async (pageParams) => await getReplies({ user, postId, offset, pageParams }),
            feedName: `posts/replies/${postId}`,
            user,
            offset,
            ttl: postFeedTTL
        })
    )
    res.json({ posts })
});

export default router;