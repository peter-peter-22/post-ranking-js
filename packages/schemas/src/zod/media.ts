import { z } from "zod";

export const MediaFileSchema = z.object({
    description: z.string().optional(),
    url: z.string(),
    mimeType: z.string()
});

export const ServerMediaSchema = z.object({
    bucketName: z.string(),
    objectName: z.string(),
    lastModified: z.date(),
    mimeType: z.string(),
    description: z.string().optional()
})

export type MediaFile = z.infer<typeof MediaFileSchema>;
export type ServerMedia = z.infer<typeof ServerMediaSchema>;