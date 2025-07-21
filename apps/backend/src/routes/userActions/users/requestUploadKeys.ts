import { Request, Response, Router } from 'express';
import z from "zod";
import { authRequestStrict } from '../../../authentication';
import { acceptedImageTypes, uploadKeyExpiration } from '../../../objectStorage/common';
import { ImageUploadOptions } from '../../../objectStorage/uploadOptions';
import { createImageUploadKey } from '../../../userActions/posts/uploadKeys';
import { env } from '../../../zod/env';

const router = Router();

const signProfileUploadSchema = z.object({
    mimeType: z.enum(acceptedImageTypes),
})

/** Create an upload key for an profile picture uploaded by an user. */
router.post('/avatar', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Parse input
    const data = signProfileUploadSchema.parse(req.body)
    // Define options
    const options: ImageUploadOptions = {
        bucket_name: env.MINIO_PUBLIC_BUCKET,
        object_name: `users/${user.id}/profile/avatar.webp`,
        mime_type: data.mimeType,
        upload_mime_type: "image/webp",
        convert_to: "WEBP",
        quality: 70,
        limit_resolution: { x: 1920, y: 1080 },
        max_size: 10_000_000,
        describe: false,
    }
    // Create upload key
    const key = await createImageUploadKey(user.id, options, uploadKeyExpiration)
    res.status(201).json({ key })
});

/** Create an upload key for an profile picture uploaded by an user. */
router.post('/banner', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Parse input
    const data = signProfileUploadSchema.parse(req.body)
    // Define options
    const options: ImageUploadOptions = {
        bucket_name: env.MINIO_PUBLIC_BUCKET,
        object_name: `users/${user.id}/profile/banner.webp`,
        mime_type: data.mimeType,
        upload_mime_type: "image/webp",
        convert_to: "WEBP",
        quality: 70,
        limit_resolution: { x: 1920, y: 1080 },
        max_size: 10_000_000,
        describe: false,
    }
    // Create upload key
    const key = await createImageUploadKey(user.id, options, uploadKeyExpiration)
    res.status(201).json({ key })
});


export default router;