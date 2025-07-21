import { MediaFile } from "../../types/media";
import { convertSingleServerMedia } from "../posts/convertPostMedia";
import { MediaUpload } from "./useMultipleMediaUpload";

export function getUploadProcessUrl(upload: MediaUpload) {
    if (upload.localData) return upload.localData.previewUrl
    if (upload.cloudData) return convertSingleServerMedia(upload.cloudData).url
}

export function getUploadProcessFile(upload: MediaUpload): MediaFile|undefined {
    if (upload.localData) return { url: upload.localData.previewUrl, description: "Uploaded media", mimeType:upload.localData.mimeType }
    if (upload.cloudData) return convertSingleServerMedia(upload.cloudData)
}