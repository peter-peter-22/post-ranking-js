import Box from '@mui/material/Box';
import { useTheme } from "@mui/material/styles";
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '.';
import GradientLogo from '../assets/svg/GradientLogo';
import { getStandardGradient } from '../utilities/getStandardGradient';

type ProtectedRouteProps = {
    children?: ReactNode
}

/** Redirect to login page when not authenticated. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    // Get auth context
    const { user, loading } = useAuth()

    // Get redirect url
    const location = useLocation();
    const { pathname } = location;
    const query = new URLSearchParams({ redirectUrl: pathname }).toString()

    if (loading)
        return <AuthenticationLoadingScreen />
    if (!user) {
        return <Navigate to={"/?" + query} />;
    }
    return children;
};

type RedirectWhenAuthenticatedProps = {
    children?: ReactNode
    to: string
}

/** Reditect somewhere when authenticated. */
export function RedirectWhenAuthenticated({ children, to }: RedirectWhenAuthenticatedProps) {
    // Get auth context
    const { user, loading } = useAuth()

    if (loading)
        return <AuthenticationLoadingScreen />
    if (user) {
        return <Navigate to={to} />;
    }
    return children;
};

export function AwaitAuthentication({ children }: { children: ReactNode }) {
    // Get auth context
    const { loading } = useAuth()

    if (loading)
        return <AuthenticationLoadingScreen />
    return children;
};

export function AuthenticationLoadingScreen() {
    const theme = useTheme()
    const gradient = getStandardGradient(theme)
    return (
        <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100vh",
            bgcolor: theme.palette.background.paper,
        }}>
            <GradientLogo sx={{fontSize:100}} gradient={gradient} />
        </Box>
    )
}