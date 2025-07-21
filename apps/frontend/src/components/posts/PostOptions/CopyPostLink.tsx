import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { SyntheticEvent, useCallback, useState } from 'react';
import { getAbsoluteUrl } from '../../../urls/common';
import { getPostUrl } from '../../../urls/posts';
import { usePost } from '../PostContext';
import { useUser } from '../../users/UserContext';
import { requireUser, useMainStore } from '../../globalStore/mainStore';

export default function CopyPostLink() {
    const { postId } = usePost()
    const [copied, setCopied] = useState(false)
    const { userId } = useUser()
    const userHandle = useMainStore(requireUser(userId, user => user.handle))

    const handleClick = useCallback((e: SyntheticEvent) => {
        e.stopPropagation()
        if (copied) return
        navigator.clipboard.writeText(getAbsoluteUrl(getPostUrl(postId, userHandle)));
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }, [copied, postId])

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <ShareOutlinedIcon fontSize="small" />
            </ListItemIcon>
            {copied ? "Copied!" : "Copy link"}
        </MenuItem>
    )
}