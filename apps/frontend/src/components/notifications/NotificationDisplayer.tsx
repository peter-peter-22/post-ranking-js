import { Notification } from '../../api/notifications';
import LikeNotificationDisplayer from './categories/LikeNotification';
import ReplyNotificationDisplayer from './categories/ReplyNotification';
import FollowNotificationDisplayer from './categories/FollowNotification';
import MentionNotification from './categories/MentionNotification';
import { SyntheticEvent } from 'react';
import { ListItemButtonProps } from '@mui/material/ListItemButton';

export type NotificationDisplayerProps = { notification: Notification }

export default function NotificationDisplayer({ notification }: NotificationDisplayerProps) {
    return (
        notification.type === "like" ? (
            <LikeNotificationDisplayer notification={notification} />
        ) : notification.type === "reply" ? (
            <ReplyNotificationDisplayer notification={notification} />
        ) : notification.type === "follow" ? (
            <FollowNotificationDisplayer notification={notification} />
        ) : (
            <MentionNotification notification={notification} />
        )
    )
}

export function notificationProps({ notification, onClick }: { notification: Notification, onClick?: (e: SyntheticEvent) => void }): ListItemButtonProps {
    return {
        selected: !notification.read,
        onClick: (e: SyntheticEvent) => {
            notification.read = true
            if (onClick) onClick(e)
        }
    }
}