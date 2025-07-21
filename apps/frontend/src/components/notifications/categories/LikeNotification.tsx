import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from "@mui/material/Typography";
import { LikeNotification } from '../../../api/notifications';
import { PostPreviewDisplayer, UserPreviewName, UserPreviewsDisplayer } from '../General';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { useNavigate } from 'react-router-dom';
import { getPostUrl } from '../../../urls/posts';
import { useAuthStrict } from '../../../authentication';
import { notificationProps } from '../NotificationDisplayer';

export default function LikeNotificationDisplayer({ notification }: { notification: LikeNotification }) {
    const navigate = useNavigate()
    const { user } = useAuthStrict()
    return (
        <ListItem disablePadding >
            <ListItemButton
                alignItems="flex-start"
                {...notificationProps({
                    notification,
                    onClick: () => { navigate(getPostUrl(notification.data.postId, user.handle)) }
                })}
            >
                <ListItemIcon >
                    <ThumbUpAltOutlinedIcon color="primary" fontSize='large' />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <>
                            <UserPreviewsDisplayer users={notification.secondaryData.users} count={notification.secondaryData.count} />
                            {notification.secondaryData.users.length === 1 ? (
                                <Typography>
                                    <UserPreviewName
                                        user={notification.secondaryData.users[0]}
                                    />{ } liked your post.
                                </Typography >
                            ) : (
                                <Typography>
                                    <UserPreviewName
                                        user={notification.secondaryData.users[0]}
                                    />{ } and {notification.secondaryData.count - 1} others liked your post.
                                </Typography >
                            )}
                        </>
                    }
                    secondary={
                        <PostPreviewDisplayer post={notification.secondaryData.post} />
                    }
                    disableTypography
                />
            </ListItemButton>
        </ListItem>

    )
}