import { and, eq, lt } from "drizzle-orm";
import { db } from "../..";
import { pendingUploads } from "../../schema/pendingUploads";
import { minioClient } from "../../../objectStorage/client";
import { posts } from "../../schema/posts";

/** The age a pending upload has to finalize in ms. */
const maxAge = 5 * 60 * 1000

/** Delete pending uploaded files and the pending posts those are older than the max age. */
export async function clearFailedUploads() {
    console.log("Clearing failed uploads...")
    // Get the files to delete.
    const limit = new Date(Date.now() - maxAge)
    const filesToDelete = await db
        .select()
        .from(pendingUploads)
        .where(lt(pendingUploads.createdAt, limit))

    console.log(`Found ${filesToDelete.length} uploads to remove.`)
    if (filesToDelete.length === 0)
        return

    // Group files by bucket.
    const filesPerBucket = new Map<string, string[]>()
    for (const file of filesToDelete) {
        const bucket = file.bucketName
        let objects = filesPerBucket.get(bucket)
        if (objects === undefined) {
            objects = []
            filesPerBucket.set(bucket, objects)
        }
        objects.push(file.objectName)
    }

    // Delete from object storage.
    await Promise.all(
        Array.from(filesPerBucket.entries()).map(([bucket, files]) => (
            minioClient.removeObjects(
                bucket,
                files
            )
        ))
    )
    console.log("Deleted pending uploads from object storage.")

    // Delete from database.
    await db.delete(pendingUploads).where(lt(pendingUploads.createdAt, limit))
    console.log("Deleted pending uploads from database.")

    // Remove the failed pending posts.
    await db.delete(posts).where(and(
        lt(posts.createdAt, limit),
        eq(posts.pending,true)
    ))
    console.log("Deleted pending posts.")

    console.log("All failed uploads have been deleted.")
}

