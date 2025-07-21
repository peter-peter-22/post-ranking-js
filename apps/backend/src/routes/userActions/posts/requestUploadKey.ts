import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import z from "zod";
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { posts } from '../../../db/schema/posts';
import { acceptedImageTypes, acceptedVideoTypes, uploadKeyExpiration } from '../../../objectStorage/common';
import { ImageUploadOptions, VideoUploadOptions } from '../../../objectStorage/uploadOptions';
import { createImageUploadKey, createVideoUploadKey } from '../../../userActions/posts/uploadKeys';
import { env } from '../../../zod/env';

const router = Router();

const signPostUploadSchema = z.object({
    /** Pending post id created before the first upload */
    pendingPostId: z.string(),
    /** The id of the media file among the other files of the post */
    id: z.number().int()
});

const signPostImageUploadSchema = signPostUploadSchema.extend({
    mimeType: z.enum(acceptedImageTypes),
})

const signPostVideoUploadSchema = signPostUploadSchema.extend({
    mimeType: z.enum(acceptedVideoTypes),
})

/** Create an upload key for an image uploaded by an user. */
router.post('/image', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Parse input
    const data = signPostImageUploadSchema.parse(req.body)
    await checkPostOwnership(user.id, data.pendingPostId)
    // Define options
    const options: ImageUploadOptions = {
        bucket_name: env.MINIO_PUBLIC_BUCKET,
        object_name: `users/${user.id}/posts/${data.pendingPostId}/images/${data.id}.webp`,
        mime_type: data.mimeType,
        upload_mime_type: "image/webp",
        convert_to: "WEBP",
        quality: 70,
        limit_resolution: { x: 1920, y: 1080 },
        max_size: 10_000_000,
        describe: true,
    }
    // Create upload key
    const key = await createImageUploadKey(user.id, options, uploadKeyExpiration)
    res.status(201).json({ key })
});

/** Create an upload key for an video uploaded by an user. */
router.post('/video', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Parse input
    const data = signPostVideoUploadSchema.parse(req.body)
    await checkPostOwnership(user.id, data.pendingPostId)
    // Define options
    const options: VideoUploadOptions = {
        bucket_name: env.MINIO_PUBLIC_BUCKET,
        object_name: `users/${user.id}/posts/${data.pendingPostId}/videos/${data.id}.mp4`,
        mime_type: data.mimeType,
        upload_mime_type: "video/mp4",
        convert_to: "mp4",
        bitrate: "1000k",
        limit_resolution: { x: 1920, y: 1080 },
        max_size: 50_000_000,
        describe: true,
    }
    // Create upload key
    const key = await createVideoUploadKey(user.id, options, uploadKeyExpiration)
    res.status(201).json({ key })
});

/** Check if a user owns a post */
async function checkPostOwnership(userId: string, postId: string) {
    const [post] = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, postId))
    if (!post)
        throw new Error("Post not found")
    if (post.userId !== userId)
        throw new Error("You don't own this post")
}

export default router;