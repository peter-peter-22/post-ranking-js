import Box, { BoxProps } from "@mui/material/Box";
import { MediaFile } from "../../types/media";
import { FocusableMediaDisplayer, FullscreenMediaProvider } from "../media/FullscreenMedia";

export const defaultBanner: MediaFile = {
    url: "/images/defaults/banner.webp",
    mimeType: "image/webp",
    description: "Default banner"
}

/** Display use banner. */
export default function UserBannerFocusable({ file, ...props }: BoxProps & { file?: MediaFile }) {
    return (
        <FullscreenMediaProvider files={[file || defaultBanner]}>
            <Box
                component={FocusableMediaDisplayer}
                sx={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                }}
                aria-labelledby="user banner"
                {...props}
            />
        </FullscreenMediaProvider>
    )
}