import { VideoHTMLAttributes } from "react";

/** Standard video displayer */
export default function VideoDisplayer({ ...props }: VideoHTMLAttributes<HTMLVideoElement>) {
    return (
        <video controls {...props} />
    )
}