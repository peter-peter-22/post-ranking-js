import { MediaFile, ServerMedia } from "@me/schemas/src/zod/media";
import { getMediaUrl } from "../../api/media/mediaApi";

/** Convert media from the backend to a format that can be displayed on the client. */
export function convertServerMedia(files: ServerMedia[]): MediaFile[] {
    return files.map(file => convertSingleServerMedia(file))
}

/** Convert media from the backend to a format that can be displayed on the client. */
export function convertSingleServerMedia(file: ServerMedia) {
    return {
        url: getMediaUrl(file.bucketName, file.objectName),
        mimeType: file.mimeType,
        description: file.description
    }
}