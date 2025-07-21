import { db } from "../../db";
import { pendingUploads } from "../../db/schema/pendingUploads";
import { mediaTransformerApi } from "../../objectStorage/mediaTransformer";
import { ImageUploadOptions, VideoUploadOptions } from "../../objectStorage/uploadOptions";
import crypto from "crypto";

/** Create an upload key for an image */
export async function createImageUploadKey(userId: string, options: ImageUploadOptions, expiration: number) {
    const key = generateRandomKey()
    await Promise.all([
        // Create upload key on the image transformer API
        mediaTransformerApi.post("/sign/image", {
            key,
            expiration,
            options
        }),
        // Store a the metadata in the database
        db
            .insert(pendingUploads)
            .values({
                userId,
                bucketName: options.bucket_name,
                objectName: options.object_name,
            })
            .onConflictDoUpdate({
                target: [pendingUploads.bucketName, pendingUploads.objectName],
                set: {
                    userId,
                    bucketName: options.bucket_name,
                    objectName: options.object_name,
                }
            })
    ])
    return key
}

/** Create an upload key for a video */
export async function createVideoUploadKey(userId: string, options: VideoUploadOptions, expiration: number) {
    const key = generateRandomKey()
    await Promise.all([
        // Create upload key on the image transformer API
        mediaTransformerApi.post("/sign/video", {
            key,
            expiration,
            options
        }),
        // Store a the metadata in the database
        db.insert(pendingUploads).values({
            userId,
            bucketName: options.bucket_name,
            objectName: options.object_name,
        })
    ])
    return key
}

/** Generate a random string */
function generateRandomKey() {
    return crypto.randomBytes(100).toString('hex');
}