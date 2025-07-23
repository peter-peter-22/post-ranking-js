import { desc, eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { db } from '../../db';
import { posts } from '../../db/schema/posts';
import { cachedPosts } from '../../redis/postContent/read';
import { cachedUsers } from '../../redis/users/read';
import { users } from '../../db/schema/users';
import { enrichUsers } from '../../redis/users/enrich';

const router = Router();

router.get('/readPosts', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: posts.id }).from(posts).orderBy(desc(posts.createdAt)).limit(10)
    await cachedPosts.read(testIds.map(t => t.id))
    res.sendStatus(200)
});

router.get('/readUsers', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: users.id }).from(users).orderBy(desc(users.createdAt)).limit(10)
    await cachedUsers.read(testIds.map(t => t.id))
    res.sendStatus(200)
});

router.get('/readEnrichedPosts', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: posts.id }).from(posts).orderBy(desc(posts.createdAt)).limit(10)
    await cachedPosts.read(testIds.map(t => t.id))
    res.sendStatus(200)
});

router.get('/readEnrichedUsers', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: users.id }).from(users).orderBy(desc(users.createdAt)).limit(10)
    await enrichUsers(testIds.map(t => t.id), testIds[0].id)
    res.sendStatus(200)
});

router.get('/readEnrichedUsersGuest', async (req: Request, res: Response) => {
    const testIds = await db.select({ id: users.id }).from(users).orderBy(desc(users.createdAt)).limit(10)
    await enrichUsers(testIds.map(t => t.id))
    res.sendStatus(200)
});


export default router;