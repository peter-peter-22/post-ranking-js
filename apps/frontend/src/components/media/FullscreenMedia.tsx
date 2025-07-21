import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from "@mui/material/Box";
import Modal from '@mui/material/Modal';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { MediaFile } from "../../types/media";
import AltIconButton from "../buttons/AltIconButton";
import MediaDisplayer, { MediaDisplayerProps } from "./Media";

type FullscreenMediaContextType = {
    show: (fileId?: number) => void,
    close: () => void,
    files: MediaFile[]
}

const FullscreenMediaContext = createContext<FullscreenMediaContextType | undefined>(undefined)

type FullscreenMediaProviderProps = {
    files: MediaFile[],
    children: ReactNode
}

export function FullscreenMediaProvider({ files, children }: FullscreenMediaProviderProps) {
    const [open, setOpen] = useState(false)
    const [id, setId] = useState<number>(0)

    const show = useCallback((fileId: number = 0) => {
        setId(fileId)
        setOpen(true)
    }, [files])

    const close = useCallback(() => {
        setOpen(false)
    }, [])

    const page = useCallback((direction: number) => {
        setId((prev) => {
            let next = prev + direction
            if (next >= files.length)
                next = 0
            if (next < 0)
                next = files.length - 1
            return next
        })
    }, [])

    const fileToDisplay = files[id]

    const showButtons = files.length > 1

    return fileToDisplay && (
        <FullscreenMediaContext.Provider value={{ show, close, files }}>
            {children}
            <Modal
                open={open}
                onClose={close}
                aria-describedby="full screen media modal"
            >
                <Stack
                    height="100dvh"
                    gap={2}
                    sx={{ p: 2, pointerEvents: "none", outline: "none" }}
                >
                    <Stack
                        direction={"row"}
                        sx={{ flexGrow: 1, overflow: "hidden", position: "relative" }}
                        gap={1}
                        alignItems={"center"}
                    >
                        <AltIconButton
                            size="large"
                            sx={{
                                pointerEvents: "all",
                                position: "absolute",
                                top: 0,
                                right: 0,
                            }}
                            onClick={close}
                        >
                            <CloseIcon />
                        </AltIconButton>
                        {showButtons &&
                            <AltIconButton
                                size="large"
                                sx={{ pointerEvents: "all" }}
                                onClick={() => page(-1)}
                            >
                                <NavigateBeforeIcon />
                            </AltIconButton>
                        }
                        <Stack
                            alignItems={"center"}
                            justifyContent={"center"}
                            sx={{ flexGrow: 1, height: "100%" }}
                        >
                            <Box
                                component={MediaDisplayer}
                                file={fileToDisplay}
                                sx={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    pointerEvents: "all",
                                    borderRadius: 1
                                }}
                            />
                        </Stack>
                        {showButtons &&
                            <AltIconButton
                                size="large"
                                sx={{ pointerEvents: "all" }}
                                onClick={() => page(1)}
                            >
                                <NavigateNextIcon />
                            </AltIconButton>
                        }
                    </Stack>
                    <Typography color="white" textAlign={"center"}>
                        {fileToDisplay.description || `Media ${id + 1} of ${files.length}`}
                    </Typography>
                </Stack>
            </Modal>
        </FullscreenMediaContext.Provider>
    )
}

export function useFullscreenMedia() {
    const data = useContext(FullscreenMediaContext)
    if (!data) throw new Error("useFullscreenMedia must be used within a FullscreenMediaProvider")
    return data
}

export type FocusableMediaDisplayerProps = Omit<MediaDisplayerProps, "file"> & {
    fileId?: number
}

export function FocusableMediaDisplayer({ fileId = 0, imgProps, ...props }: FocusableMediaDisplayerProps) {
    const { files, show } = useFullscreenMedia()
    const file = files[fileId]
    return (
        <Box
            {...props}
            component={MediaDisplayer}
            imgProps={{
                ...imgProps,
                onClick: () => show(fileId),
            }}
            file={file}
            sx={{ cursor: "pointer" }}
        />
    )
}