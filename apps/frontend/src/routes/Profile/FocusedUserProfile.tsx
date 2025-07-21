import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useShallow } from 'zustand/react/shallow';
import { requireUser, useMainStore } from '../../components/globalStore/mainStore';
import LayoutBox from '../../components/layout/mainLayout/LayoutBox';
import { convertSingleServerMedia } from '../../components/posts/convertPostMedia';
import FollowButton from '../../components/users/FollowButton';
import { FollowerCounter, FollowingCounter } from '../../components/users/FollowCounter';
import UserAvatarFocusable from '../../components/users/UserAvatarFocusable';
import UserBannerFocusable from "../../components/users/UserBannerFocusable";
import { useUser } from '../../components/users/UserContext';
import UserHandle from '../../components/users/UserHandle';
import UserName from '../../components/users/UserName';
import UserOptions from '../../components/users/UserOptions';
import { formatDate } from '../../utilities/formatDate';
import { ProfileEditorProvider } from './EditProfileDialog';
import UserActivityTabs from './UserActivityTabs';

export default function FocusedUserProfile() {
    const theme = useTheme()
    const { userId } = useUser()
    const user = useMainStore(useShallow(
        requireUser(
            userId,
            user => ({
                profilePicture: user.avatar,
                profileBanner: user.banner,
                handle: user.handle,
                name: user.name,
                createdAt: user.createdAt,
                bio: user.bio
            })
        )
    ))
    return (
        <ProfileEditorProvider>
            <LayoutBox>
                <Paper
                    sx={{
                        overflow: "hidden"
                    }}
                >
                    <UserBannerFocusable file={user.profileBanner ? convertSingleServerMedia(user.profileBanner) : undefined} />
                    <UserAvatarFocusable
                        file={user.profilePicture ? convertSingleServerMedia(user.profilePicture) : undefined}
                        handle={user.handle}
                        sx={{
                            width: 120,
                            height: 120,
                            transform: "translateY(-50%)",
                            ml: 2,
                            borderColor: theme.palette.background.paper,
                            borderWidth: 5,
                            borderStyle: "solid",
                            marginBottom: `${-60}px`
                        }}
                    />
                    <Stack gap={1} sx={{ p: 2 }}>
                        <Stack direction={"row"} justifyContent={"space-between"}>
                            <div>
                                <UserName variant="h5" component="h1" name={user.name} />
                                <UserHandle handle={user.handle} component="h2" />
                            </div>
                            <Stack direction={"row"} alignItems={"start"} spacing={1}>
                                <FollowButton size='medium' />
                                <UserOptions />
                            </Stack>
                        </Stack>
                        <Typography variant="body1">
                            {user.bio}
                        </Typography>
                        <Stack direction={"row"} alignItems={"center"} gap={1}>
                            <EventOutlinedIcon color="action" />
                            <Typography variant="body2" color="textSecondary" >
                                Joined {formatDate(user.createdAt)}
                            </Typography>
                        </Stack>
                        <Stack direction={"row"} gap={2}>
                            <FollowerCounter />
                            <FollowingCounter />
                        </Stack>
                    </Stack>
                </Paper>
                <UserActivityTabs />
            </LayoutBox>
        </ProfileEditorProvider>
    )
}

