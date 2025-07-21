import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import { useState } from 'react';
import FollowUser from '../../users/UserOptions/FollowUser';
import CopyPostLink from './CopyPostLink';
import DeletePost from './DeletePost';
import EditPost from './EditPost';
import ViewProfile from './ViewProfile';

export default function PostOptions() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                size="small"
                edge="end"
                aria-describedby='open post options menu'
                onClick={handleClick}
            >
                <MoreHorizIcon />
            </IconButton>
            <Menu
                aria-describedby='post options menu'
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClick={handleClose}
            >
                <FollowUser />
                <ViewProfile />
                <Divider />
                <CopyPostLink />
                <DeletePost />
                <EditPost />
            </Menu>
        </>
    )
}