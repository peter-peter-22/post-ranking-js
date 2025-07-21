import Badge from '@mui/material/Badge';
import { ReactNode } from 'react';
import { useUpdateStore } from '../../../regularUpdates/updateStore';

export default function NotificationBadge({ children }: { children: ReactNode }) {
    const count=useUpdateStore(state=>state.notifications)
    return (
        <Badge
            badgeContent={count}
            color="primary"
            max={99}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            {children}
        </Badge>
    )
}