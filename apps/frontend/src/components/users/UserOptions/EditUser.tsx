import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../../../authentication';
import { useUser } from '../UserContext';
import { useProfileEditor } from '../../../routes/Profile/EditProfileDialog';

export default function EditUser() {
    const { userId } = useUser()
    const { user: me } = useAuth()
    const isMe = me && userId === me.id
    const { show } = useProfileEditor()
    return isMe && (
        <MenuItem onClick={show}>
            <ListItemIcon>
                <EditOutlinedIcon />
            </ListItemIcon>
            Edit profile
        </MenuItem>
    )
}