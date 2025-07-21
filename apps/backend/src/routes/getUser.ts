import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequest } from '../authentication';
import { db } from '../db';
import { personalUserColumns } from '../db/controllers/users/getUser';
import { users } from '../db/schema/users';
import { HttpError } from '../middlewares/errorHandler';
import { postProcessUsers } from '../db/controllers/users/postProcessUsers';

const router = Router();

const GetUserSchema = z.object({
    handle: z.string()
})

router.get('/:handle', async (req: Request, res: Response) => {
    const { handle } = GetUserSchema.parse(req.params)
    const authUser = await authRequest(req)
    const [user] = await postProcessUsers(
        await db
            .select(personalUserColumns(authUser?.id))
            .from(users)
            .where(eq(users.handle, handle))
    )
    if (!user) throw new HttpError(404, "User not found")
    res.json({ user })
});

export default router;