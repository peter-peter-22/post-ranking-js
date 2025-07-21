import Avatar, { AvatarProps } from "@mui/material/Avatar";
import { getUploadProcessUrl } from "../../components/media/uploadProcessCommon";
import { MediaUpload } from "../../components/media/useMultipleMediaUpload";

export default function EditProfilePicture({ upload, sx, ...props }: AvatarProps & { upload?: MediaUpload }) {
    return (
        <Avatar
            src={upload && getUploadProcessUrl(upload)}
            sx={{
                cursor: "pointer",
                ...sx
            }}
            aria-describedby="click to open profile picture edit dialog"
            aria-haspopup="true"
            {...props}
        />
    )
}