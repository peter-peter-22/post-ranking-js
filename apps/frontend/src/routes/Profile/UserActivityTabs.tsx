import Paper from "@mui/material/Paper";
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ReactNode } from "react";
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { useUser } from "../../components/users/UserContext";
import UserContents from "./ProfileContents";

export interface TabRoute {
    label: string;
    path: string;
    element: ReactNode;
}

function UserContentManager({ replies }: { replies: boolean }) {
    const { userId } = useUser()
    return (
        <UserContents userId={userId} replies={replies} />
    )
}

export const userActivityTabs: TabRoute[] = [
    { label: 'Posts', path: '', element: <UserContentManager replies={false} /> },
    { label: 'Replies', path: 'replies', element: <UserContentManager replies={true} /> }
];

/** List different kinds of user activities using the outlet. */
export default function UserActivityTabs() {
    const navigate = useNavigate();

    // Find current tab based on path
    const match = useMatch('/users/:id/:tab');
    const currentTab = match?.params.tab || '';

    const handleTabChange = (_event: React.SyntheticEvent, newPath: string) => {
        const route = userActivityTabs.find(tab => tab.path === newPath);
        if (route) navigate(route.path);
    };

    return (
        <>
            <Paper sx={{ overflow: "hidden", my: 2 }}>
                <Tabs value={currentTab} onChange={handleTabChange} variant='fullWidth'>
                    {userActivityTabs.map(route => (
                        <Tab key={route.path} label={route.label} value={route.path} />
                    ))}
                </Tabs>
            </Paper>
            <Outlet />
        </>
    )
}