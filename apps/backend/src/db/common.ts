import { varchar, vector } from "drizzle-orm/pg-core";
import { z } from "zod";

/** 384 dimensions vector for 'all-MiniLM-L6-v2' */
export const embeddingVector=(name:string)=>vector(name,{ dimensions: 384 })

/** A short text for a keyword. */
export const keyword=()=>varchar({ length: 50 })

/** A media file stored in minio */
export const MediaFileSchema=z.object({
    bucketName:z.string(),
    objectName:z.string(),
    lastModified:z.coerce.date().default(new Date()).transform(date=>date.toISOString()),
    mimeType:z.string(),
    description:z.string().optional()
})
export type MediaFile=z.infer<typeof MediaFileSchema>