import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Typography from "@mui/material/Typography";
import { PostPreview, UserPreview } from '../../api/notifications';
import { formatNumber } from '../../utilities/formatNumber';
import { convertSingleServerMedia } from '../posts/convertPostMedia';
import UserNameLink, { UserNameProps } from '../users/UserNameLink';
import { SyntheticEvent } from 'react';

export function PostPreviewDisplayer({ post }: { post: PostPreview }) {
    return (
        <>
            {post.text &&
                <Typography color="textSecondary" variant="body2" >
                    {post.text}
                </Typography>
            }
            {post.media && post.media.length > 0 &&
                <Typography color="textSecondary" variant="body2" >
                    +<span style={{ fontWeight: "bold" }}>{post.media.length}</span> media
                </Typography>
            }
        </>
    )
}

export function UserPreviewsDisplayer({ users, count }: { users: UserPreview[], count?: number }) {
    return (
        <AvatarGroup
            renderSurplus={(surplus) => <span>+{formatNumber(surplus)}</span>}
            total={count}
            max={Math.max(users.length, 2)}
            slotProps={{ additionalAvatar: { sx: { width: 30, height: 30, fontSize: 15 } } }}
        >
            {users.map((user, i) => (
                <UserPreviewAvatar
                    key={i}
                    user={user}
                    size={30}
                />
            ))}
        </AvatarGroup>
    )
}

export function UserPreviewAvatar({ user, size }: { user: UserPreview, size: number }) {
    return (
        <Avatar
            alt={user.name}
            src={user.avatar ? convertSingleServerMedia(user.avatar).url : undefined}
            sx={{ width: size, height: size }}
        />
    )
}

export function UserPreviewName({ user, ...props }: Omit<UserNameProps, "handle" | "name"> & { user: UserPreview }) {
    return (
        <UserNameLink
            handle={user.handle}
            name={user.name}
            variant='inherit'
            onClick={(e: SyntheticEvent) => { e.stopPropagation() }}
            {...props}
        />
    )
}