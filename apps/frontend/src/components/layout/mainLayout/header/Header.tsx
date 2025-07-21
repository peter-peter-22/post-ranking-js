import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import Paper from "@mui/material/Paper";
import Stack from '@mui/material/Stack';
import { useTheme } from "@mui/material/styles";
import GradientLogo from '../../../../assets/svg/GradientLogo';
import { useAuth } from '../../../../authentication';
import { getUserUrl } from '../../../../urls/user';
import { getStandardGradient } from '../../../../utilities/getStandardGradient';
import HeaderNavLink from '../../../buttons/HeaderNavLink';
import { queryClient } from '../../../contexts/TanstackProvider';
import { useUpdateStore } from '../../../regularUpdates/updateStore';
import LayoutBox from '../LayoutBox';
import NotificationBadge from './NotificationBadge';
import PostButton from './PostButton';
import UserMenu from './UserMenu';

export default function Header() {
    const theme = useTheme()
    const gradient = getStandardGradient(theme)
    const { user } = useAuth()
    return (
        <LayoutBox
            sx={{
                width: 300,
                position: "sticky",
                top: 0,
            }}
        >
            <Paper
                component="nav"
                sx={{
                    p: 2,
                    height: "100%"
                }}
            >
                <Stack height="100%">
                    <GradientLogo
                        gradient={gradient}
                        sx={{
                            mx: "auto",
                            fontSize: 100,
                            mb: 2
                        }}
                    />
                    <Stack gap={1} >
                        <HeaderNavLink
                            to="/home"
                            icon={<HomeOutlinedIcon />}
                        >
                            Home
                        </HeaderNavLink>
                        <HeaderNavLink
                            to="/notifications"
                            icon={<NotificationBadge><NotificationsOutlinedIcon /></NotificationBadge>}
                            onClick={async () => {
                                useUpdateStore.getState().setNotifications(0)
                                await queryClient.invalidateQueries({ queryKey: ["notifications"] })
                                await queryClient.resetQueries({ queryKey: ["notifications"] })
                            }}
                        >
                            Notifications
                        </HeaderNavLink>
                        {user &&
                            <HeaderNavLink
                                to={getUserUrl(user?.handle || "/")}
                                icon={<PersonOutlinedIcon />}
                            >
                                Profile
                            </HeaderNavLink>
                        }
                        <HeaderNavLink
                            to="/search"
                            icon={<ExploreOutlinedIcon />}
                        >
                            Search
                        </HeaderNavLink>
                        <HeaderNavLink
                            to="/trends"
                            icon={<TimelineOutlinedIcon />}
                        >
                            Trends
                        </HeaderNavLink>
                    </Stack>
                    <PostButton />
                    <UserMenu sx={{ mt: 10 }} />
                </Stack>
            </Paper>
        </LayoutBox>
    )
}