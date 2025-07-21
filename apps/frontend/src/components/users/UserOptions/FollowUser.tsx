import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import PersonRemoveAlt1OutlinedIcon from '@mui/icons-material/PersonRemoveAlt1Outlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { SyntheticEvent, useCallback } from 'react';
import { useAuth } from '../../../authentication';
import { useUser } from '../UserContext';
import { useFollowUser } from '../useFollowUser';

export default function FollowUser() {
    const { userId } = useUser()
    const {toggleFollow,followed}=useFollowUser(userId)
    const { user: me } = useAuth()
    const isMe = me && userId === me.id
    const handleClick = useCallback((e: SyntheticEvent) => {
        e.stopPropagation()
        toggleFollow()
    }, [toggleFollow])
    return !isMe && (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                {followed ? <PersonRemoveAlt1OutlinedIcon fontSize="small" /> : <PersonAddAlt1OutlinedIcon fontSize="small" />}
            </ListItemIcon>
            {followed ? "Unfollow" : "Follow"}
        </MenuItem>
    )
}