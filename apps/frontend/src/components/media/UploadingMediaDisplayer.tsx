import CloseIcon from '@mui/icons-material/Close';
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MediaFile } from "../../types/media";
import AltIconButton from "../buttons/AltIconButton";
import { FocusableMediaDisplayer, FullscreenMediaProvider } from "./FullscreenMedia";
import { MediaUpload, MediaUploader } from "./useMultipleMediaUpload";
import { convertServerMedia } from '../posts/convertPostMedia';

type UploadingMediaDisplayerProps = {
    uploader: MediaUploader
}

/** The media files of a post with automatic alignment. */
export default function UploadingMediaDisplayer({ uploader }: UploadingMediaDisplayerProps) {
    const { uploads } = uploader

    const files: MediaFile[] = useMemo(() => {
        return uploader.uploads.map(({ localData, cloudData }) => {
            if (cloudData)
                return convertServerMedia([cloudData])[0]
            if (localData)
                return {
                    mimeType: localData.mimeType,
                    url: localData.previewUrl,
                    description: "Uploaded file"
                }
            return {
                mimeType: "image/webp",
                url: "images/uploadError.webp",
                description: "Failed upload"
            }
        })
    }, [uploads])

    return uploads.length > 0 && (
        <FullscreenMediaProvider files={files}>
            <Box sx={{ overflowX: "auto" }}>
                <Stack direction={"row"} gap={1} sx={{ width: "fit-content" }}>
                    {uploads.map((upload, i) => (
                        <Box
                            key={i}
                            sx={{
                                width: 100,
                                height: 100,
                                overflow: "hidden",// Otherwise the image creates a ~5px margin below it
                                borderRadius: 1,
                                position: "relative"
                            }}
                        >
                            <Box
                                sx={{
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                }}
                                component={FocusableMediaDisplayer}
                                fileId={i}
                            />
                            {upload.uploadProcess && <UploadProgressDisplayer upload={upload} />}
                            <DeleteButton uploader={uploader} index={i} />
                        </Box>
                    ))}
                </Stack>
            </Box>
        </FullscreenMediaProvider >
    );
}

/** Button to remove a file. */
function DeleteButton({ uploader, index }: { uploader: MediaUploader, index: number }) {
    const remove = useCallback(() => {
        uploader.removeFile(index)
    }, [index, uploader])
    return (
        <AltIconButton
            size="small"
            onClick={remove}
            sx={{ position: "absolute", right: 0, top: 0, m: 0.5 }}
        >
            <CloseIcon />
        </AltIconButton>
    )
}

/** Display the progress of an upload by using it's event. */
function UploadProgressDisplayer({ upload }: { upload: MediaUpload }) {
    const theme = useTheme()

    const [progress, setProgress] = useState(0)
    const [finished, setFinished] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        const uploadProcess = upload.uploadProcess
        if (!uploadProcess) throw Error("Upload process is not defined")

        const update = ({ uploadProcess }: MediaUpload) => {
            setProgress(uploadProcess?.progress || 0)
            setFinished(uploadProcess?.finished || false)
            setError(uploadProcess?.error || false)
        }

        // Make sure the component handles synchronous errors
        update(upload)

        uploadProcess.progressEvent.subscribe(update)
        return () => { uploadProcess.progressEvent.unsubscribe(update) }
    }, [upload])

    return (!finished || error) && (
        <Stack
            gap={1}
            sx={{
                backgroundColor: theme.palette.action.active,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none"
            }}
        >
            {
                error ? (
                    <Typography
                        color={theme.palette.common.white}
                    >
                        Error
                    </Typography>
                ) : (
                    <>
                        <CircularProgress
                            size={20}
                            sx={{ color: theme.palette.common.white }}
                            value={progress}
                            variant={progress === 100 || progress === 0 ? "indeterminate" : "determinate"}
                        />
                        <Typography
                            color={theme.palette.common.white}
                        >
                            {progress}%
                        </Typography>
                    </>
                )
            }
        </Stack>
    )
}