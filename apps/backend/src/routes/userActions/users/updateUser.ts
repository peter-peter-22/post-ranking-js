import { EditProfileFormSchema, UpdateUserResponse } from '@me/schemas/src/zod/createUser';
import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { userActions } from '../../../userActions/main';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    // Get the updated values of the user
    const newUser = EditProfileFormSchema.parse(req.body);
    // Get user
    const user = await authRequestStrict(req)
    // Update
    const updatedUser = await userActions.users.update(user, newUser)
    // Return updated user
    res.status(201).json({ user: updatedUser } as UpdateUserResponse)
});

export default router;