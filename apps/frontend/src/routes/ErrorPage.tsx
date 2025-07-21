import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { useRouteError } from "react-router-dom";
import ErrorDisplayer from '../components/error/ErrorDisplayer';

export default function ErrorPage() {
    const error = useRouteError();
    return (
        <Container maxWidth={"md"} >
            <Stack sx={{ height: "100vh", justifyContent: "center" }}>
                <ErrorDisplayer error={error} />
            </Stack>
        </Container>
    );
}