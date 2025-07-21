import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { updateMedia } from '../../../db/controllers/pendingUploads/updateMedia';
import {  posts } from '../../../db/schema/posts';
import { HttpError } from '../../../middlewares/errorHandler';
import { personalizePosts } from '../../../posts/hydratePosts';
import { prepareAnyPost } from '../../../userActions/posts/preparePost';
import { getOnePost } from '../../getPost';
import { createPostSchema } from './createPost';

const router = Router();

const UpdatePostSchema = createPostSchema.extend({
    id: z.string()
})

router.post('/', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the updated values of the post
    const post = UpdatePostSchema.parse(req.body);
    // Check if the updated post is valid
    const [previousPost] = await db
        .select({
            userId: posts.userId,
            pending: posts.pending,
            media: posts.media
        })
        .from(posts)
        .where(eq(posts.id, post.id))
    if (previousPost.userId !== user.id) throw new HttpError(401, "This is not your post")
    if (previousPost.pending === true) throw new HttpError(400, "This post is still pending")
    // Update the media of the post
    await updateMedia(previousPost.media || [], post.media || [])
    // Prepare the post
    const postToInsert = await prepareAnyPost({ ...post, userId: user.id })
    // Exclude the id from the update to avoid error while updating
    const { id, ...valuesToUpdate } = postToInsert
    // Update the post
    const [updatedPost] = await db
        .update(posts)
        .set({ ...valuesToUpdate, pending: false })
        .where(eq(posts.id, post.id))
        .returning()
    // Format the post to the standard format
    const [personalPost] = await personalizePosts(getOnePost(updatedPost.id), user)
    // Return updated posts
    res.status(201).json({ post: personalPost })
    console.log("Post updated")
});

export default router;