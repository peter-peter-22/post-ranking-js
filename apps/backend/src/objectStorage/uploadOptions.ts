type Vector2Int = {
    x: number,
    y: number
}

type ImageFormat = "WEBP" | "JPEG"

type ImageVariant = {
    bucket_name?: string
    object_name: string
    upload_mime_type?: string
    convert_to?: ImageFormat 
    quality?: number 
    limit_resolution?: Vector2Int 
}

export type ImageUploadOptions = {
    bucket_name: string
    object_name: string
    mime_type?: string 
    upload_mime_type: string
    convert_to?: ImageFormat
    quality?: number 
    limit_resolution?: Vector2Int 
    max_size?: number 
    describe?: boolean 
    prompt?: string
    prompt_max_tokens?: number 
    variants?: ImageVariant[] 
    skip_upload?: boolean 
}

type VideoFormat = "mp4" | "webm"

type FfmpegSettings = {
    vf?: string 
    vcodec?: string 
    acodec?: string 
}

export type VideoUploadOptions = {
    bucket_name: string
    object_name: string
    mime_type?: string
    upload_mime_type: string
    convert_to?: VideoFormat 
    bitrate?: string 
    limit_resolution?: Vector2Int 
    max_size?: number 
    ffmpeg_settings?: FfmpegSettings
    describe: boolean 
    prompt?: string 
    prompt_max_tokens?: number 
    skip_upload?: boolean 
}