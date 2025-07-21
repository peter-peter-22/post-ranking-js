import { SnackbarProvider } from 'notistack';
import { ReactNode } from 'react';

export default function NotistackProvider({ children }: { children: ReactNode }) {
    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={5000}
            anchorOrigin={{
                vertical: "top",
                horizontal: "center"
            }}
        >
            {children}
        </SnackbarProvider>
    )
}