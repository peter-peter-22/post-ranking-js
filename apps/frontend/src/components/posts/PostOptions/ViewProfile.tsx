import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import { getUserUrl } from '../../../urls/user';
import { requireUser, useMainStore } from '../../globalStore/mainStore';
import { useUser } from '../../users/UserContext';

export default function ViewProfile() {
    const {userId}=useUser()
    const userHandle=useMainStore(requireUser(userId,user=>user.handle))
    return (
        <MenuItem component={Link} to={getUserUrl(userHandle)}>
            <ListItemIcon>
                <PersonSearchOutlinedIcon fontSize="small" />
            </ListItemIcon>
            View profile
        </MenuItem>
    )
}