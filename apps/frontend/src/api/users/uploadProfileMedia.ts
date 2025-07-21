import { MediaUploadLocalData } from "../../components/media/useMultipleMediaUpload"
import { apiClient } from "../api"
import { CreateUploadKeyResponseSchema, uploadSignedFile } from "../media/signedUpload"

// Profile

async function createProfileUploadKey(data:MediaUploadLocalData) {
    const res = await apiClient.post("/userActions/signUserUpload/avatar", { mimeType: data.mimeType })
    const { key } = CreateUploadKeyResponseSchema.parse(res.data)
    return key
}

async function uploadSignedProfile(
    file: File,
    key: string,
    onProgress?: (progressPercent: number) => void
) {
    return await uploadSignedFile("/signed_upload/image", file, key, onProgress)
}

export async function uploadProfile(data:MediaUploadLocalData, onProgress?: (percent: number) => void) {
    const key = await createProfileUploadKey(data)
    return await uploadSignedProfile(data.file, key, onProgress)
}

// Banner

async function createBannerUploadKey(data:MediaUploadLocalData) {
    const res = await apiClient.post("/userActions/signUserUpload/banner", { mimeType: data.mimeType })
    const { key } = CreateUploadKeyResponseSchema.parse(res.data)
    return key
}

async function uploadSignedBanner(
    file: File,
    key: string,
    onProgress?: (progressPercent: number) => void
) {
    return await uploadSignedFile("/signed_upload/image", file, key, onProgress)
}

export async function uploadBanner(data:MediaUploadLocalData, onProgress?: (percent: number) => void) {
    const key = await createBannerUploadKey(data)
    return await uploadSignedBanner(data.file, key, onProgress)
}

export type UploadMediaFunction = typeof uploadProfile