import Avatar, { AvatarProps } from '@mui/material/Avatar';
import { memo } from 'react';
import { MediaFile } from '../../types/media';

export type UserAvatarProps = Omit<AvatarProps, "src"> & { file?: MediaFile, handle: string }

/** Display the profile picture of a user. */
const UserAvatar = memo(({ file, handle, ...props }: UserAvatarProps) => {
    return (
        <Avatar
            src={file?.url}
            alt={`${handle}'s profile picture`}
            {...props}
            aria-labelledby="user profile image"
        />
    )
})

export default UserAvatar