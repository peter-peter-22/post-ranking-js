import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import { useState } from 'react';
import FollowUser from './FollowUser';
import EditUser from './EditUser';

export default function UserOptions() {
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
                edge="end"
                aria-describedby='open user options menu'
                onClick={handleClick}
            >
                <MoreHorizIcon />
            </IconButton>
            <Menu
                aria-describedby='user options menu'
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
                <EditUser />
            </Menu>
        </>
    )
}