import { apiClient } from "../../api"
import { CreateUploadKeyResponseSchema, uploadSignedFile } from "../../media/signedUpload"

type PostUploadKeySettings = {
    mimeType: string
}

// Image

async function createImageUploadKey(data: PostUploadKeySettings) {
    const res = await apiClient.post("/userActions/signPostUpload/image", data)
    const { key } = CreateUploadKeyResponseSchema.parse(res.data)
    return key
}

async function uploadSignedImage(
    file: File,
    key: string,
    onProgress: (progressPercent: number) => void
) {
    return await uploadSignedFile("/signed_upload/image", file, key, onProgress)
}

export async function uploadImage(settings: PostUploadKeySettings, file: File, onProgress: (percent: number) => void) {
    const key = await createImageUploadKey(settings)
    return await uploadSignedImage(file, key, onProgress)
}

// Video

async function createVideoUploadKey(data: PostUploadKeySettings) {
    const res = await apiClient.post("/userActions/signPostUpload/video", data)
    const { key } = CreateUploadKeyResponseSchema.parse(res.data)
    return key
}

async function uploadSignedVideo(
    file: File,
    key: string,
    onProgress: (progressPercent: number) => void
) {
    return await uploadSignedFile("/signed_upload/video", file, key, onProgress)
}

export async function uploadVideo(settings: PostUploadKeySettings, file: File, onProgress: (percent: number) => void) {
    const key = await createVideoUploadKey(settings)
    return await uploadSignedVideo(file, key, onProgress)
}