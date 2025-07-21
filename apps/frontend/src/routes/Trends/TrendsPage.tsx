import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { SyntheticEvent } from "react";
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { globalTrends, personalTrends } from '../../api/trends/feeds';
import TopNavBar from "../../components/layout/tabs/TopTabSelector";
import TrendFeed from '../../components/trends/TrendFeed';
import { TabRoute } from "../Profile/UserActivityTabs";

export const trendTabs: TabRoute[] = [
    { label: 'Global', path: '', element: <GlobalTrends />, },
    { label: 'For you', path: 'relevant', element: <PersonalTrends /> }
];

export default function TrendsPage() {
    const navigate = useNavigate();

    // Find current tab based on path
    const match = useMatch('/trends/:tab');
    const currentTab = match?.params.tab || '';

    const handleTabChange = (_event: SyntheticEvent, newPath: string) => {
        const route = trendTabs.find(tab => tab.path === newPath);
        if (!route) return
        navigate(route.path);
    };

    return (
        <>
            <TopNavBar>
                <Tabs value={currentTab} onChange={handleTabChange} variant='fullWidth'>
                    {trendTabs.map(route => (
                        <Tab key={route.path} label={route.label} value={route.path} />
                    ))}
                </Tabs>
            </TopNavBar>
            <Outlet />
        </>
    )
}

function GlobalTrends() {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <TrendFeed
                queryKey={["trends", "global"]}
                queryFn={async (offset?: number) => await globalTrends({ offset })}
            />
        </Paper>
    )
}

function PersonalTrends() {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <TrendFeed
                queryKey={["trends", "personal"]}
                queryFn={async (offset?: number) => await personalTrends({ offset })}
            />
        </Paper>
    )
}