import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { MediaFileSchema } from '../../../db/common';
import { updateMedia } from '../../../db/controllers/pendingUploads/updateMedia';
import { userColumns, users } from '../../../db/schema/users';

const router = Router();

const UpdateUserSchema = z.object({
    name: z.string().optional(),
    handle: z.string().optional(),
    bio: z.string().optional().nullable(),
    avatar: MediaFileSchema.optional().nullable(),
    banner: MediaFileSchema.optional().nullable()
})

router.post('/', async (req: Request, res: Response) => {
    // Get the updated values of the user
    const newUser = UpdateUserSchema.parse(req.body);
    // Get user
    const user = await authRequestStrict(req)
    // Update the media of the user
    await Promise.all([
        updateMedia(user.avatar ? [user.avatar] : [], newUser.avatar ? [newUser.avatar] : []),
        updateMedia(user.banner ? [user.banner] : [], newUser.banner ? [newUser.banner] : [])
    ])
    // Update the user
    const [updatedUser] = await db
        .update(users)
        .set(newUser)
        .where(eq(users.id, user.id))
        .returning(userColumns)
    // Return updated user
    res.status(201).json({ user: updatedUser })
});

export default router;