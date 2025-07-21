import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { SyntheticEvent } from "react";
import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import TopNavBar from "../../components/layout/tabs/TopTabSelector";
import { TabRoute } from "../Profile/UserActivityTabs";
import SearchField from "./SearchField";
import SearchLatestPosts from './LatestPosts';
import SearchTopPosts from './TopPosts';
import UserSearchPage from './SearchUsers';

export const searchTabs: TabRoute[] = [
    { label: 'Latest', path: '', element: <SearchLatestPosts /> },
    { label: 'Top', path: 'top', element: <SearchTopPosts /> },
    { label: 'People', path: 'people', element: <UserSearchPage /> }
];

/** List different kinds of user activities using the outlet. */
export default function SearchPage() {
    const navigate = useNavigate();

    // Find current tab based on path
    const match = useMatch('/search/:tab');
    const currentTab = match?.params.tab || '';
    const [searchParams] = useSearchParams();

    const handleTabChange = (_event: SyntheticEvent, newPath: string) => {
        const route = searchTabs.find(tab => tab.path === newPath);
        if (route) navigate("/search/" + route.path + "?" + searchParams.toString());
    };

    return (
        <>
            <TopNavBar>
                <SearchField />
                <Tabs value={currentTab} onChange={handleTabChange} variant='fullWidth'>
                    {searchTabs.map(route => (
                        <Tab key={route.path} label={route.label} value={route.path} />
                    ))}
                </Tabs>
            </TopNavBar>
            <Outlet />
        </>
    )
}