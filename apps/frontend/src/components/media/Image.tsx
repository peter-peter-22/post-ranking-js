import { ImgHTMLAttributes } from "react";

/** Standard image displayer */
export default function ImageDisplayer({ ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img {...props} />
    )
}