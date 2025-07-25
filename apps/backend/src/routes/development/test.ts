import { desc } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../authentication';
import { db } from '../../db';
import { posts } from '../../db/schema/posts';
import { users } from '../../db/schema/users';
import { enrichPosts } from '../../redis/postContent/enrich';
import { enrichUsers } from '../../redis/users/enrich';
import { cachedUsers } from '../../redis/users/read';
import { removeUndefinedMapValues } from '../../utilities/arrays/removeUndefinedMapValues';
import { cachedPostRead } from '../../redis/postContent/read';

const router = Router();

router.get('/readPosts', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: posts.id }).from(posts).orderBy(desc(posts.createdAt)).limit(10)
    const data = await cachedPostRead.read(testIds.map(t => t.id))
    res.json({ data: [...data] })
});

router.get('/readUsers', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: users.id }).from(users).orderBy(desc(users.createdAt)).limit(10)
    const data = await cachedUsers.read(testIds.map(t => t.id))
    res.json({ data: [...data] })
});

router.get('/readEnrichedPosts', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: posts.id }).from(posts).orderBy(desc(posts.createdAt)).limit(10)
    const user = await authRequestStrict(req)
    const myPosts = removeUndefinedMapValues(await cachedPostRead.read(testIds.map(t => t.id)))
    const enrichedPosts = await enrichPosts(
        myPosts,
        user.id
    )
    res.json({ data: [...enrichedPosts] })
});

router.get('/readEnrichedUsers', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: users.id }).from(users).orderBy(desc(users.createdAt)).limit(10)
    const data = await enrichUsers(testIds.map(t => t.id), testIds[0].id)
    res.json({ data: [...data] })
});

router.get('/readEnrichedUsersGuest', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: users.id }).from(users).orderBy(desc(users.createdAt)).limit(10)
    const data = await enrichUsers(testIds.map(t => t.id))
    res.json({ data: [...data] })
});


export default router;