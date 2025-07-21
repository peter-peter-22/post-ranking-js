import { desc, like } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { db } from '../../../db';
import { users } from '../../../db/schema/users';
import { trends } from '../../../db/schema/trends';
import { getTrendColumns } from '../../../db/controllers/trends/getTrends';

const router = Router();

const mentionPredictions = 10
const hashtagPredictions = 10

const TextPredictionSchema = z.object({
    text: z.string()
})

router.post('/mention', async (req: Request, res: Response) => {
    // Get the processed text
    const { text } = TextPredictionSchema.parse(req.body);
    // Get the recommended users
    const predictedUsers = await db
        .select({ handle: users.handle, name: users.name })
        .from(users)
        .where(like(users.handle, `${text}%`))
        .orderBy(desc(users.followerCount))
        .limit(mentionPredictions)
    // Return the simplified user objects
    res.json({ users: predictedUsers })
});

router.post('/hashtag', async (req: Request, res: Response) => {
    // Get the processed text
    const { text } = TextPredictionSchema.parse(req.body);
    // Get the recommended users
    const predictedHashtags = await db
        .select(getTrendColumns())
        .from(trends)
        .where(like(trends.keyword, `${text}%`))
        .orderBy(desc(trends.postCount))
        .limit(hashtagPredictions)
    // Return the simplified user objects
    res.json({ hashtags: predictedHashtags })
});

export default router;