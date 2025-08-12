import { ServerMediaSchema } from '@me/schemas/src/zod/media';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { enrichPost } from '../../../redis/postContent/enrich';
import { userActions } from '../../../userActions/main';

const router = Router();

export const createPostSchema = z.object({
    text: z.string().optional(),
    replyingTo: z.string().optional(),
    media: z.array(ServerMediaSchema).optional()
})
export type PostToCreate = z.infer<typeof createPostSchema> & { userId: string }

const finalizePostSchema = createPostSchema.extend({
    id: z.string()
})
export type PostToFinalize = z.infer<typeof finalizePostSchema> & { userId: string }

router.post('/post', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the values of the post
    const post = createPostSchema.parse(req.body);
    // Create the posts
    const created = await userActions.posts.create({ ...post, userId: user.id })
    // Format the post to the standard format
    const personalPost = await enrichPost(created, user)
    // Return created posts
    res.status(201).json({ created: personalPost })
    console.log("Post created")
});

export default router;