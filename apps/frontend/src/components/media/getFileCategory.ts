type MediaCategory = "image" | "video"

export function getFileCategory(mimeType: string): MediaCategory {
    if (mimeType.startsWith("image")) return "image"
    if (mimeType.startsWith("video")) return "video"
    throw new Error(`Invalid mimetype "${mimeType}"`)
}