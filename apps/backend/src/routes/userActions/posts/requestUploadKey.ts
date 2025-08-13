import { Request, Response, Router } from 'express';
import z from "zod";
import { authRequestStrict } from '../../../authentication';
import { acceptedImageTypes, acceptedVideoTypes, uploadKeyExpiration } from '../../../objectStorage/common';
import { ImageUploadOptions, VideoUploadOptions } from '../../../objectStorage/uploadOptions';
import { createImageUploadKey, createVideoUploadKey } from '../../../userActions/posts/uploadKeys';
import { generateRandomKey } from '../../../utilities/randomKey';
import { env } from '../../../zod/env';

const router = Router();

const SignPostImageUploadSchema = z.object({
    mimeType: z.enum(acceptedImageTypes),
})

const SignPostVideoUploadSchema = z.object({
    mimeType: z.enum(acceptedVideoTypes),
})

/** Create an upload key for an image uploaded by an user. */
router.post('/image', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Parse input
    const data = SignPostImageUploadSchema.parse(req.body)
    // Define options
    const options: ImageUploadOptions = {
        bucket_name: env.MINIO_PUBLIC_BUCKET,
        object_name: `users/${user.id}/posts/images/${generateUploadName()}.webp`,
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
    const data = SignPostVideoUploadSchema.parse(req.body)
    // Define options
    const options: VideoUploadOptions = {
        bucket_name: env.MINIO_PUBLIC_BUCKET,
        object_name: `users/${user.id}/posts/videos/${generateUploadName()}.mp4`,
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

function generateUploadName() {
    return Date.now() + "_" + generateRandomKey(20)
}

export default router;