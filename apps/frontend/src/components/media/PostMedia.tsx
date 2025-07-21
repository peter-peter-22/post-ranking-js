import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid';
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { MediaFile } from "../../types/media";
import { FocusableMediaDisplayer, FullscreenMediaProvider } from "./FullscreenMedia";

export type PostMediaProps = {
    files: MediaFile[],
    maxCount?: number
}

/** The media files of a post with automatic alignment. */
export default function PostMedia({ files, maxCount = 4 }: PostMediaProps) {
    const theme = useTheme()
    return (
        <FullscreenMediaProvider files={files}>
            {
                files.length === 1 ? (
                    <Box
                        borderRadius={1}
                        sx={{ height: 300, width: "fit-content", maxWidth: "100%", objectFit: "cover" }}
                        component={FocusableMediaDisplayer}
                    />
                ) : (
                    <Grid container spacing={2}  >
                        {files.slice(0, maxCount).map((_file, i) => (
                            <Grid
                                size={6}
                                key={i}
                                sx={{
                                    aspectRatio: 1 / 1,
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
                                {i === maxCount - 1 && files.length > maxCount && (
                                    <Box
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
                                            pointerEvents:"none"
                                        }}
                                    >
                                        <Typography
                                            variant="h4"
                                            component={"p"}
                                            color={theme.palette.common.white}
                                        >
                                            +{files.length - maxCount}
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                )
            }
        </FullscreenMediaProvider>
    );
}