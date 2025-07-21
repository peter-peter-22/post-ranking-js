import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { ReactElement } from "react";
import { Outlet, useRouteError } from "react-router-dom";
import Header from "./header/Header";
import RegularUpdateHandler from "../../regularUpdates/RegularUpdateHandler";
import ErrorDisplayer, { ErrorDisplayerProps } from "../../error/ErrorDisplayer";
import LayoutBox from "./LayoutBox";

export default function MainLayout() {
    return (
        <Stack direction={"row"} gap={2} sx={{ mx: 2, justifyContent: "center", alignItems: "start" }}>
            <RegularUpdateHandler />
            <Header />
            <Box sx={{ flexGrow: 1, maxWidth: 950 }}>
                <Outlet />
            </Box>
        </Stack>
    )
}

export function MainLayoutInner({ right, middle }: { right?: ReactElement, middle: ReactElement }) {
    return (
        <Stack direction={"row"} gap={2}>
            <Box sx={{ flexGrow: 1, maxWidth: "middle" }} component="main">
                {middle}
            </Box>
            <Box sx={{ width: 300 }}>
                {right}
            </Box>
        </Stack>
    )
}

export function MainLayoutError(props: Omit<ErrorDisplayerProps, "error">) {
    const error = useRouteError();
    return (
        <MainLayoutInner
            middle={
                <LayoutBox>
                    <ErrorDisplayer error={error} {...props} />
                </LayoutBox>
            }
        />
    )
}