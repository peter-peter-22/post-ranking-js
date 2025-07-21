import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { SyntheticEvent, useCallback, useState } from 'react';
import { getAbsoluteUrl } from '../../../urls/common';
import { getUserUrl } from '../../../urls/user';
import { useUser } from '../UserContext';
import { requireUser, useMainStore } from '../../globalStore/mainStore';

export default function CopyUserLink() {
    const { userId } = useUser()
    const handle=useMainStore(requireUser(userId,user=>user.handle))
    const [copied, setCopied] = useState(false)

    const handleClick = useCallback((e: SyntheticEvent) => {
        e.stopPropagation()
        if (copied) return
        navigator.clipboard.writeText(getAbsoluteUrl(getUserUrl(handle)));
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }, [copied, handle])

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <ShareOutlinedIcon fontSize="small" />
            </ListItemIcon>
            {copied ? "Copied!" : "Copy link"}
        </MenuItem>
    )
}