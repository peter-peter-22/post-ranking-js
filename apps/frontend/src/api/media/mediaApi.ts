const mediaApiUrl = "http://localhost:8003"

export function getMediaUrl(bucketName: string, objectKey: string) {
    return `${mediaApiUrl}/get/${bucketName}/${objectKey}`
}

export const acceptedImageTypes = ["image/png", "image/jpeg", "image/webp"]
export const acceptedVideoTypes = ["video/mp4"]
export const acceptedMediaTypes = [...acceptedImageTypes, ...acceptedVideoTypes]