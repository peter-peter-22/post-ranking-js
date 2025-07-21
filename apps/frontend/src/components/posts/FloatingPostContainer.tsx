import Dialog from '@mui/material/Dialog';
import { ReactNode } from "react";

export default function FloatingPostCreatorContainer({ open, close, children }: { open: boolean, close: () => void, children: ReactNode }) {
    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="middle"
        >
            {children}
        </Dialog>
    )
}