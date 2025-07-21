import Box, { BoxProps } from "@mui/material/Box";
import MediaDisplayer from "../../components/media/Media";
import { getUploadProcessFile } from "../../components/media/uploadProcessCommon";
import { MediaUpload } from "../../components/media/useMultipleMediaUpload";
import { defaultBanner } from "../../components/users/UserBannerFocusable";

export default function EditProfileBanner({ upload, sx, ...props }: BoxProps & { upload?: MediaUpload }) {
    return (
        <Box
            component={MediaDisplayer}
            file={upload ? getUploadProcessFile(upload) ?? defaultBanner : defaultBanner}
            sx={{
                cursor: "pointer",
                ...sx
            }}
            aria-describedby="click to open profile banner edit dialog"
            aria-haspopup="true"
            {...props}
        />
    )
}