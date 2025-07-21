import { Router } from "express";
import { z } from "zod";
import { authRequestStrict } from "../../../authentication";
import { likePost } from "../../../userActions/posts/like";

const router = Router();

const LikePostSchema = z.object({
    postId: z.string(),
    value: z.boolean()
})

router.post('/', async (req, res) => {
    const user = await authRequestStrict(req)
    const {postId,value} = LikePostSchema.parse(req.body);
    await likePost(postId,user.id,value);
    res.sendStatus(200)
})

export default router