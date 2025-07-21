import { HTMLAttributes, ImgHTMLAttributes, VideoHTMLAttributes } from "react";
import { MediaFile } from "../../types/media";
import ImageDisplayer from "./Image";
import VideoDisplayer from "./Video";
import { getFileCategory } from "./getFileCategory";

export type MediaDisplayerProps = HTMLAttributes<HTMLElement> & {
    file: MediaFile
    imgProps?: ImgHTMLAttributes<HTMLImageElement>
    videoProps?: VideoHTMLAttributes<HTMLVideoElement>
}

/** Standard automatic media displayer */
export default function MediaDisplayer({ file, imgProps, videoProps, ...props }: MediaDisplayerProps) {
    // Decide the category based on the mimetype
    const category = getFileCategory(file.mimeType)
    // Return the component of the media category
    return category === "image" ? (
        <ImageDisplayer {...props} {...imgProps} src={file.url} alt={file.description} />
    ) : (
        <VideoDisplayer {...props} {...videoProps} src={file.url} />
    )
}