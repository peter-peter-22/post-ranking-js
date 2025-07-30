import { Router } from "express";
import { z } from "zod";
import { authRequestStrict } from "../../../authentication";
import { userActions } from "../../../userActions/main";

const router = Router();

const LikePostSchema = z.object({
    postId: z.string(),
    value: z.boolean()
})

router.post('/', async (req, res) => {
    const user = await authRequestStrict(req)
    const { postId, value } = LikePostSchema.parse(req.body);
    if (value) await userActions.posts.engagements.actions.likes.add(user.id, [postId]);
    else await userActions.posts.engagements.actions.likes.remove(user.id, [postId]);
    res.sendStatus(200)
})

export default router