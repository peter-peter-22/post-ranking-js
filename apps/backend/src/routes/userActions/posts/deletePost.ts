import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { personalizePosts } from '../../../posts/hydratePosts';
import { userActions } from '../../../userActions/main';
import { getOnePost } from '../../getPost';

const router = Router();

const DeletePostSchema = z.object({
    id: z.string()
})

router.post('/', async (req: Request, res: Response) => {
    const user = await authRequestStrict(req)
    const { id } = DeletePostSchema.parse(req.body);
    await userActions.posts.delete(id, user)
    console.log(`Deleted post ${id}`)
    res.sendStatus(200)
});

router.post('/restore', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the values of the post
    const { id } = DeletePostSchema.parse(req.body);
    const restored = await userActions.posts.restore(id, user)
    // Add personal data 
    const [personalPost] = await personalizePosts(getOnePost(restored.id), user)
    // OK
    console.log(`Restored post ${id}`)
    res.json({ post: personalPost })
});

export default router;