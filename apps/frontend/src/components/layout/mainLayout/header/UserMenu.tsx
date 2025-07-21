import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ButtonBase } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from "@mui/material/Stack";
import { SxProps, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStrict } from "../../../../authentication";
import { requireUser, useMainStore } from '../../../globalStore/mainStore';
import { convertSingleServerMedia } from '../../../posts/convertPostMedia';
import UserAvatar from "../../../users/UserAvatar";
import { UserProvider } from '../../../users/UserContext';

export default function UserMenu({ sx }: { sx: SxProps }) {
    // Navigation
    const navigate = useNavigate()

    // Theme
    const theme = useTheme()

    // User
    const { user, logout } = useAuthStrict()
    const globalUser = useMainStore(useShallow(requireUser(user.id, user => ({
        handle: user.handle,
        avatar: user.avatar
    }))))

    // Floating menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return user && (
        <UserProvider userId={user.id}>
            <ButtonBase
                sx={{
                    p: 1,
                    borderRadius: 999,
                    width: "100%",
                    justifyContent: "stretch",
                    "&:hover": {
                        backgroundColor: theme.palette.action.hover
                    },
                    ...sx
                }}
                onClick={handleClick}
            >
                <Stack
                    direction={"row"}
                    gap={1}
                    alignItems={"center"}
                    width={"100%"}
                >
                    <UserAvatar handle={globalUser.handle} file={globalUser.avatar !== null ? convertSingleServerMedia(globalUser.avatar) : undefined} />
                    <Stack sx={{ overflow: "hidden" }} alignItems={"start"}>
                        <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}
                            color="textPrimary"
                        >
                            {user.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}
                        >
                            @{user.handle}
                        </Typography>
                    </Stack>
                    <MoreHorizIcon
                        color="secondary"
                        sx={{ ml: "auto" }}
                    />
                </Stack>
            </ButtonBase>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
            >
                <MenuItem
                    onClick={
                        () => {
                            logout()
                            navigate("/")
                        }
                    }
                >Logout</MenuItem>
            </Menu>
        </UserProvider>
    )
}