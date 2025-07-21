import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from "@mui/material/Typography";
import { MentionNotification } from '../../../api/notifications';
import { PostPreviewDisplayer, UserPreviewName, UserPreviewsDisplayer } from '../General';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { useNavigate } from 'react-router-dom';
import { getPostUrl } from '../../../urls/posts';
import { notificationProps } from '../NotificationDisplayer';

export default function MentionNotificationDisplayer({ notification }: { notification: MentionNotification }) {
    const navigate = useNavigate()
    return (
        <ListItem disablePadding >
            <ListItemButton
                alignItems="flex-start"
                {...notificationProps({
                    notification,
                    onClick: () => { navigate(getPostUrl(notification.data.postId, notification.secondaryData.mention.user.handle)) }
                })}
            >
                <ListItemIcon >
                    <ReviewsOutlinedIcon color="primary" fontSize='large' />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <>
                            <UserPreviewsDisplayer
                                users={[notification.secondaryData.mention.user]}
                                count={1}
                            />
                            <Typography>
                                <UserPreviewName
                                    user={notification.secondaryData.mention.user}
                                />{ } mentioned you.
                            </Typography >
                        </>
                    }
                    secondary={
                        <PostPreviewDisplayer post={notification.secondaryData.mention.post} />
                    }
                    disableTypography
                />
            </ListItemButton>
        </ListItem>
    )
}