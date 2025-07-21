import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../../../authentication';
import { useUser } from '../../users/UserContext';
import { usePostEditor } from '../EditPostContext';

export default function EditPost() {
    const { userId } = useUser()
    const { user: auth } = useAuth()
    const isMine = auth && auth.id === userId
    const { show } = usePostEditor()

    return isMine && (
        <MenuItem onClick={show}>
            <ListItemIcon>
                <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Edit
        </MenuItem>
    )
}