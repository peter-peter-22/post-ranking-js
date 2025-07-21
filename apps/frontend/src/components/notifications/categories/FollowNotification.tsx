import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from "@mui/material/Typography";
import { useNavigate } from 'react-router-dom';
import { FollowNotification } from '../../../api/notifications';
import { useAuthStrict } from '../../../authentication';
import { getUserUrl } from '../../../urls/user';
import { UserPreviewName, UserPreviewsDisplayer } from '../General';
import { notificationProps } from '../NotificationDisplayer';

export default function FollowNotificationDisplayer({ notification }: { notification: FollowNotification }) {
    const navigate = useNavigate()
    const { user } = useAuthStrict()
    return (
        <ListItem disablePadding >
            <ListItemButton
                alignItems="flex-start"
                {...notificationProps({
                    notification,
                    onClick: () => navigate(
                        notification.secondaryData.users.length === 1 ? (
                            getUserUrl(notification.secondaryData.users[0].handle)
                        ) : (
                            `/users/${user.handle}/followers`
                        )
                    )
                })}
            >
                <ListItemIcon >
                    <PersonAddOutlinedIcon color="primary" fontSize='large' />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <>
                            <UserPreviewsDisplayer users={notification.secondaryData.users} count={notification.secondaryData.count} />
                            {notification.secondaryData.users.length === 1 ? (
                                <Typography>
                                    <UserPreviewName
                                        user={notification.secondaryData.users[0]}
                                    />{ } followed you.
                                </Typography >
                            ) : (
                                <Typography>
                                    <UserPreviewName
                                        user={notification.secondaryData.users[0]}
                                    />{ } and {notification.secondaryData.count - 1} others followed you.
                                </Typography >
                            )}
                        </>
                    }
                    disableTypography
                />
            </ListItemButton>
        </ListItem>
    )
}