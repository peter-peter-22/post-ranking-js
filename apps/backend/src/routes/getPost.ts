import { GetPostResponse, GetPostSchema } from "@me/schemas/src/zod/getPost";
import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { DatabaseError } from 'pg';
import { authRequest } from '../authentication';
import { db } from '../db';
import { posts } from '../db/schema/posts.js';
import { HttpError } from '../middlewares/errorHandler';
import { candidateColumns } from '../posts/common';
import { personalizePosts } from '../posts/hydratePosts';
import { postProcessPosts } from '../posts/postProcessPosts';

const router:Router = Router();

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = GetPostSchema.parse(req.params)
    const user = await authRequest(req)
    try {
        const [post] = await postProcessPosts(await (personalizePosts(getOnePost(id), user)))
        if (!post) throw new HttpError(404, 'Post not found')
        if (post.replyingTo) {
            const [replied] = await postProcessPosts(await (personalizePosts(getOnePost(post.replyingTo), user)))
            res.json({ post, replied } as GetPostResponse)
            return
        }
        res.json({ post } as GetPostResponse)
    }
    catch (e) {
        if (e instanceof DatabaseError && e.routine === "MakeParseError")
            throw new HttpError(422, "Invalid post ID")
        throw e
    }
});

export function getOnePost(id: string) {
    return db
        .select(candidateColumns("Unknown"))
        .from(posts)
        .where(eq(posts.id, id))
        .$dynamic()
}

export default router;