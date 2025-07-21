import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { useCallback } from 'react';
import { useAuth } from '../../../authentication';
import { useConfirmDialog } from '../../contexts/ConfirmDialog';
import { useUser } from '../../users/UserContext';
import { usePost } from '../PostContext';
import { useMainStore } from '../../globalStore/mainStore';
import { deletePost } from '../../../api/posts/deletePost';

export default function DeletePost() {
    const { postId } = usePost()
    const { userId } = useUser()
    const { user: auth } = useAuth()
    const isMine = auth && auth.id === userId
    const { show } = useConfirmDialog()
    const handleDelete = useCallback(() => {
        useMainStore.getState().updatePost(postId, post => ({ ...post, deleted: true }))
        deletePost(postId)
            .catch((e: Error) => {
                console.error(e)
                useMainStore.getState().updatePost(postId, post => ({ ...post, deleted: false }))
            })
    }, [postId])

    const handleClick = useCallback(() => {
        show((close) => (
            <Dialog
                aria-describedby='delete post dialog'
                open={true}
                onClose={close}
                disableRestoreFocus
            >
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to delete this post? It can be restored later.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close} autoFocus>
                        Cancel
                    </Button>
                    <Button color="error" onClick={() => { close(); handleDelete() }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        ))
    }, [])

    return isMine && (
        <MenuItem onClick={handleClick} >
            <ListItemIcon>
                <DeleteOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Delete
        </MenuItem>
    )
}