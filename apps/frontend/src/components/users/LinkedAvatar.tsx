import { AvatarProps } from '@mui/material/Avatar';
import Box, { BoxProps } from '@mui/material/Box';
import { useTheme } from "@mui/material/styles";
import { forwardRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { getUserUrl } from '../../urls/user';
import { requireUser, useMainStore } from '../globalStore/mainStore';
import UserAvatar from './UserAvatar';
import { useUser } from './UserContext';

export type LinkedAvatarProps = BoxProps & {
    avatarProps?: AvatarProps
}

/** Avatar with link to user profile. */
const LinkedAvatar = memo(forwardRef<HTMLDivElement,LinkedAvatarProps>(({ avatarProps, ...props }, ref) => {
    const { userId } = useUser()
    const userHandle = useMainStore(requireUser(userId, user => user.handle))
    const theme = useTheme()
    const tonalOffset = theme.palette.tonalOffset.valueOf() as number
    return (
        <Box
            sx={{
                flexShrink: 0,
                transition: theme.transitions.create(["filter"], { duration: theme.transitions.duration.shortest }),
                "&:hover": {
                    filter: `brightness(${1 - tonalOffset})`
                }
            }}
            component={Link}
            to={getUserUrl(userHandle)}
            ref={ref}
            {...props}
        >
            <UserAvatar handle={userHandle}  {...avatarProps} />
        </Box>
    )
}))
export default LinkedAvatar
