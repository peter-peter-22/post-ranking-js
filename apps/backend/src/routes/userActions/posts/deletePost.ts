import { and, eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { posts } from '../../../db/schema/posts';
import { HttpError } from '../../../middlewares/errorHandler';
import { getOnePost } from '../../getPost';
import { personalizePosts } from '../../../posts/hydratePosts';

const router = Router();

const DeletePostSchema = z.object({
    id: z.string()
})

router.post('/', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the values of the post
    const { id } = DeletePostSchema.parse(req.body);
    // Update the deleted state of the post
    const [deleted] = await db
        .update(posts)
        .set({ deleted: true })
        .where(and(
            eq(posts.id, id),
            eq(posts.userId, user.id)
        ))
        .returning({ id: posts.id })
    // If it was deleted
    if (!deleted) throw new HttpError(400, "This post does not exists or it is not your post.")
    // OK
    console.log(`Deleted post ${id}`)
    res.sendStatus(200)
});

router.post('/restore', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the values of the post
    const { id } = DeletePostSchema.parse(req.body);
    // Update the deleted state of the post
    const [restored] = await db
        .update(posts)
        .set({ deleted: false })
        .where(and(
            eq(posts.id, id),
            eq(posts.userId, user.id)
        ))
        .returning()
    // Check if it was restored
    if (!restored) throw new HttpError(400, "This post does not exists or it is not your post.")
    // Add personal data 
    const [personalPost] = await personalizePosts(getOnePost(restored.id), user)
    
    // OK
    console.log(`Restored post ${id}`)
    res.json({post:personalPost})
});

export default router;