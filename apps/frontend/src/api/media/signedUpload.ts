import { z } from "zod";
import { mediaClient } from "../uploadsApi";
import { ServerMedia } from "../../types/media";

export async function uploadSignedFile(
    url: string,
    file: File,
    key: string,
    onProgress?: (progressPercent: number) => void
) {
    const formData = new FormData()
    formData.append("file", file);
    formData.append("key", key);
    const res = await mediaClient.post(
        url,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (onProgress) onProgress(percent);
                }
            },
        }
    )
    return uploadResponseToServerMedia(UploadResponseSchema.parse(res.data))
}

export const CreateUploadKeyResponseSchema = z.object({
    key: z.string()
})

export const UploadResponseSchema = z.object({
    object_name: z.string(),
    bucket_name: z.string(),
    mime_type: z.string(),
    label: z.string().optional().nullable()
})

export type UploadResponse = z.infer<typeof UploadResponseSchema>

export function uploadResponseToServerMedia(upload: UploadResponse): ServerMedia {
    return {
        bucketName: upload.bucket_name,
        objectName: upload.object_name,
        lastModified: new Date(),
        mimeType: upload.mime_type,
        description: upload.label ? upload.label : undefined
    }
}