import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { SyntheticEvent } from "react";
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import TopNavBar from "../../components/layout/tabs/TopTabSelector";
import { TabRoute } from "../Profile/UserActivityTabs";
import FollowedPosts from "./FollowedPosts";
import MainFeedPosts from "./MainFeedPosts";

export const mainFeedTabs: TabRoute[] = [
    { label: 'For you', path: '', element: <MainFeedPosts /> },
    { label: 'Followed', path: 'followed', element: <FollowedPosts /> }
];

/** List different kinds of user activities using the outlet. */
export default function MainFeedTabs() {
    const navigate = useNavigate();

    // Find current tab based on path
    const match = useMatch('/home/:tab');
    const currentTab = match?.params.tab || '';

    const handleTabChange = (_event: SyntheticEvent, newPath: string) => {
        const route = mainFeedTabs.find(tab => tab.path === newPath);
        if (route) navigate(route.path);
    };

    return (
        <>
            <TopNavBar>
                <Tabs value={currentTab} onChange={handleTabChange} variant='fullWidth'>
                    {mainFeedTabs.map(route => (
                        <Tab key={route.path} label={route.label} value={route.path} />
                    ))}
                </Tabs>
            </TopNavBar>
            <Outlet />
        </>
    )
}