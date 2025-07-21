import { EditProfileFormSchema, UpdateUserResponse } from '@me/schemas/src/zod/createUser';
import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { updateMedia } from '../../../db/controllers/pendingUploads/updateMedia';
import { userColumns, users } from '../../../db/schema/users';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    // Get the updated values of the user
    const newUser = EditProfileFormSchema.parse(req.body);
    // Get user
    const user = await authRequestStrict(req)
    // Update the media of the user
    await Promise.all([
        updateMedia(user.avatar ? [user.avatar] : [], newUser.profileMedia ? [newUser.profileMedia] : []),
        updateMedia(user.banner ? [user.banner] : [], newUser.bannerMedia ? [newUser.bannerMedia] : [])
    ])
    // Update the user
    const [updatedUser] = await db
        .update(users)
        .set(newUser)
        .where(eq(users.id, user.id))
        .returning(userColumns)
    // Return updated user
    res.status(201).json({ user: updatedUser } as UpdateUserResponse)
});

export default router;