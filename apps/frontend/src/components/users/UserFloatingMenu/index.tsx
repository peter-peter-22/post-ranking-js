import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { memo, ReactElement, SyntheticEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { getUserUrl } from "../../../urls/user";
import { requireUser, useMainStore } from "../../globalStore/mainStore";
import FollowButton from "../FollowButton";
import { FollowerCounter, FollowingCounter } from "../FollowCounter";
import LinkedAvatar from "../LinkedAvatar";
import { useUser } from "../UserContext";
import UserHandle from "../UserHandle";
import UserNameLink from "../UserNameLink";

const UserFloatingMenu = memo(({ children }: { children: ReactElement }) => {
    const theme = useTheme()
    return (
        <Tooltip
            enterDelay={1000}
            title={<UserFloatingMenuInner />}
            slotProps={{
                popper: {
                    sx: {
                        "& .MuiTooltip-tooltip": {
                            backgroundColor: theme.palette.background.paper,
                            color: "unset",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: theme.palette.divider,
                            width: 300,
                            padding: 0
                        }
                    },
                },
            }}
        >
            {children}
        </Tooltip >
    )
})

function UserFloatingMenuInner() {
    const { userId } = useUser()
    const user = useMainStore(useShallow(
        requireUser(
            userId,
            user => ({
                profilePicture: user.avatar,
                handle: user.handle,
                name: user.name,
                bio: user.bio
            })
        )
    ))
    const navigate = useNavigate()
    const handleClick = useCallback((e: SyntheticEvent) => {
        // Visit the user on direct click
        const directClick = e.target === e.currentTarget
        console.log(e.target, e.currentTarget)
        if (!directClick) return
        navigate(getUserUrl(user.handle))
    }, [user.handle, navigate])
    return (
        <Stack
            gap={1}
            onClick={handleClick}
            sx={{
                cursor: "pointer",
                p: 2,
                "&>*": {
                    pointerEvents: 'none',
                },
                "img,a,video,button": {
                    pointerEvents: 'all',
                }
            }}
        >
            <Stack direction={"row"} gap={1} justifyContent={"space-between"}>
                <LinkedAvatar
                    avatarProps={{
                        sx: {
                            width: 60,
                            height: 60,
                        }
                    }}
                />
                <FollowButton />
            </Stack>
            <Stack>
                <UserNameLink name={user.name} handle={user.handle} />
                <UserHandle handle={user.handle} />
            </Stack>
            {user.bio &&
                <Typography>
                    {user.bio}
                </Typography>
            }
            <Stack direction={"row"} gap={2}>
                <FollowerCounter />
                <FollowingCounter />
            </Stack>
        </Stack >
    )
}

export default UserFloatingMenu;