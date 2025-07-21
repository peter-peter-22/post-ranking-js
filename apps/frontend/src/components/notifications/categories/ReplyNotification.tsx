import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { ListItem, ListItemAvatar } from '@mui/material';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from "@mui/material/Typography";
import { ReplyNotification } from '../../../api/notifications';
import { PostPreviewDisplayer, UserPreviewAvatar, UserPreviewName, UserPreviewsDisplayer } from '../General';
import { useNavigate } from 'react-router-dom';
import { useAuthStrict } from '../../../authentication';
import { getPostUrl } from '../../../urls/posts';
import { notificationProps } from '../NotificationDisplayer';

export default function ReplyNotificationDisplayer({ notification }: { notification: ReplyNotification }) {
    const overflowingReplies = notification.secondaryData.count - notification.secondaryData.replies.length
    const navigate = useNavigate()
    const { user } = useAuthStrict()
    return (
        <ListItem disablePadding >
            <ListItemButton
                alignItems="flex-start"
                {...notificationProps({
                    notification,
                    onClick: () => {
                        if (notification.secondaryData.replies.length === 1) {
                            const reply = notification.secondaryData.replies[0]
                            navigate(getPostUrl(reply.post.id, reply.user.handle))
                        }
                        else
                            navigate(getPostUrl(notification.data.postId, user.handle))
                    }
                })}
            >
                <ListItemIcon >
                    <ChatBubbleOutlineRoundedIcon color="primary" fontSize='large' />
                </ListItemIcon>
                {
                    notification.secondaryData.replies.length === 1 ? (
                        <ListItemText
                            primary={
                                <>
                                    <UserPreviewsDisplayer
                                        users={notification.secondaryData.replies.map(reply => reply.user)}
                                        count={notification.secondaryData.count}
                                    />
                                    <Typography>
                                        <UserPreviewName
                                            user={notification.secondaryData.replies[0].user}
                                        />{ } replied your post.
                                    </Typography >
                                </>
                            }
                            secondary={
                                <PostPreviewDisplayer post={notification.secondaryData.replies[0].post} />
                            }
                            disableTypography
                        />
                    ) : (
                        <ListItemText
                            primary={
                                <Typography>
                                    <UserPreviewName
                                        user={notification.secondaryData.replies[0].user}
                                    />{ } and {notification.secondaryData.count - 1} others replied to your post.
                                </Typography >
                            }
                            secondary={
                                <List>
                                    {
                                        notification.secondaryData.replies.map((reply, i) => (
                                            <ListItem
                                                alignItems='flex-start'
                                                key={i}
                                                dense
                                                disablePadding
                                            >
                                                <ListItemAvatar sx={{minWidth:40}}>
                                                    <UserPreviewAvatar
                                                        user={reply.user}
                                                        size={30}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={<UserPreviewName user={reply.user} />}
                                                    secondary={
                                                        <PostPreviewDisplayer post={reply.post} />
                                                    }
                                                    slotProps={{
                                                        secondary: { component: "div" }
                                                    }}
                                                />
                                            </ListItem>
                                        ))
                                    }
                                    {overflowingReplies > 0 &&
                                        <ListItem
                                            dense
                                            disablePadding
                                        >
                                            <ListItemText
                                                slotProps={{
                                                    primary: {
                                                        color: "textSecondary"
                                                    }
                                                }}
                                                primary={`...and ${overflowingReplies} more`}
                                            />
                                        </ListItem>
                                    }
                                </List>
                            }
                            disableTypography
                        />
                    )
                }
            </ListItemButton>
        </ListItem >
    )
}