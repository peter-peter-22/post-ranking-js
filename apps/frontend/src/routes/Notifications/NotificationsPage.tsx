import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { createContext, SyntheticEvent, useContext, useMemo } from "react";
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { notificationListAll, notificationListMentions } from '../../api/notifications';
import TopNavBar from "../../components/layout/tabs/TopTabSelector";
import NotificationFeed from '../../components/notifications/NotificationFeed';
import { TabRoute } from "../Profile/UserActivityTabs";
import Box from '@mui/material/Box';

export const notificationTabs: TabRoute[] = [
    { label: 'All', path: '', element: <AllNotifications />, },
    { label: 'Mentions', path: 'mentions', element: <Mentions /> }
];

export default function NotificationsPage() {
    const navigate = useNavigate();

    // Find current tab based on path
    const match = useMatch('/notifications/:tab');
    const currentTab = match?.params.tab || '';

    const handleTabChange = (_event: SyntheticEvent, newPath: string) => {
        const route = notificationTabs.find(tab => tab.path === newPath);
        if (!route) return
        navigate(route.path);
    };

    // The date when the notifications were upened. Defined the read state.
    const startDate = useMemo(() => new Date(), [])

    return (
        <>
            <StartDateContext.Provider value={startDate}>
                <Box sx={{ mb: 2 }}>
                    <TopNavBar>
                        <Tabs value={currentTab} onChange={handleTabChange} variant='fullWidth'>
                            {notificationTabs.map(route => (
                                <Tab key={route.path} label={route.label} value={route.path} />
                            ))}
                        </Tabs>
                    </TopNavBar>
                    <Outlet />
                </Box>
            </StartDateContext.Provider>
        </>
    )
}

const StartDateContext = createContext<Date>(new Date())

function AllNotifications() {
    const startDate = useContext(StartDateContext)
    return (
        <Paper sx={{ overflow: "hidden" }}>
            <NotificationFeed
                queryKey={["notifications", "all"]}
                queryFn={async (offset?: number) => await notificationListAll(startDate, offset)}
            />
        </Paper>
    )
}

function Mentions() {
    const startDate = useContext(StartDateContext)
    return (
        <Paper sx={{ overflow: "hidden" }}>
            <NotificationFeed
                queryKey={["notifications", "mentions"]}
                queryFn={async (offset?: number) => await notificationListMentions(startDate, offset)}
            />
        </Paper>
    )
}