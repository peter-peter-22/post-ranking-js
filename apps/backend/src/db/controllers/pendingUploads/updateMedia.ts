import { and, eq, inArray } from "drizzle-orm";
import { db } from "../..";
import { HttpError } from "../../../middlewares/errorHandler";
import { minioClient } from "../../../objectStorage/client";
import { MediaFile } from "../../common"
import { pendingUploads } from "../../schema/pendingUploads";

/** Check if the bucket names of the files are equal and return the bucket name. */
export function getBucketName(media: { bucketName: string }[]) {
    const bucketName = media[0].bucketName;
    media.forEach(file => {
        if (file.bucketName !== bucketName)
            throw new HttpError(400, "The bucket names of the files are not equal")
    })
    return bucketName
}

function mediaEqual(a: MediaFile, b: MediaFile) {
    return a.objectName === b.objectName && a.bucketName === b.bucketName
}

function mediaVersionEqual(a: MediaFile, b: MediaFile) {
    return a.lastModified === b.lastModified
}

/** Finalize the new uploads and delete the removed ones. */
export async function updateMedia(oldMedia: MediaFile[], newMedia: MediaFile[]) {
    const newUploads: MediaFile[] = newMedia.filter(newFile => {
        // Check the version only on the new uploads. This is to finalize the replaced files.
        return !oldMedia.some(oldFile => mediaEqual(oldFile, newFile) && mediaVersionEqual(oldFile, newFile))
    })
    const deletedFiles: MediaFile[] = oldMedia.filter(oldFile => {
        return !newMedia.some(newFile => mediaEqual(newFile, oldFile))
    })
    await deleteMedia(deletedFiles)
    await addMedia(newUploads)
}

/** Delete the selected files from the object storage */
export async function deleteMedia(deletedFiles: MediaFile[]) {
    if (deletedFiles.length === 0) return
    console.log(`Deleting ${deletedFiles.length} files`)
    const bucketName = getBucketName(deletedFiles)
    const objectNames = deletedFiles.map(file => file.objectName)
    if (deletedFiles.length > 0) minioClient.removeObjects(bucketName, objectNames)
}

/** Finalize the provided uploads */
export async function addMedia(newUploads: MediaFile[]) {
    if (newUploads.length === 0) return
    console.log(`Adding ${newUploads.length} files`)
    const bucketName = getBucketName(newUploads)
    const objectNames = newUploads.map(file => file.objectName)
    const [validUploads] = await Promise.all([
        // Get the pending upload entries from the database
        db
            .select()
            .from(pendingUploads)
            .where(
                and(
                    eq(pendingUploads.bucketName, bucketName),
                    inArray(pendingUploads.objectName, objectNames)
                )
            ),
    ])
    // If the number of the deleted pending upload receipts is different from the number of media in the post, then they are invalid or expired.
    if (validUploads.length !== newUploads.length)
        throw new Error(`The uploaded files are invalid or expired. Uploaded file count: ${newUploads.length}, valid file count: ${validUploads.length}`)
    // Delete the pending upload entries from the database
    await db
        .delete(pendingUploads)
        .where(
            and(
                eq(pendingUploads.bucketName, bucketName),
                inArray(pendingUploads.objectName, objectNames)
            )
        )
}
