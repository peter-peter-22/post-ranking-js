import Box, { BoxProps } from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { forwardRef } from "react";
import RichTextEditor, { RichTextEditorProps } from "./Editor";

export type ThemedEditorProps = BoxProps & {
    editorProps: RichTextEditorProps,
    error?: boolean
}

/** Post text editor with styled container. */
const ThemedEditor = forwardRef<HTMLInputElement, ThemedEditorProps>(({ sx, editorProps, error, ...props }, ref) => {
    const theme = useTheme()
    return (
        <Box
            {...props}
            ref={ref}
            sx={{
                ...sx,
                ".public-DraftEditor-content": {
                    padding: 2,
                },
                outlineStyle: "solid",
                borderRadius: 1,
                ...error ? {
                    outlineWidth: 2,
                    outlineColor: theme.palette.error.main
                } : {
                    outlineColor: theme.palette.divider,
                    outlineWidth: 1,
                    "&:hover": {
                        outlineColor: theme.palette.common.black,
                    },
                    "&:focus-within": {
                        outlineWidth: 2,
                        outlineColor: theme.palette.primary.main,
                    },
                    transition: theme.transitions.create(["outline-color"], { duration: theme.transitions.duration.shortest })
                }
            }}
        >
            <RichTextEditor {...editorProps} />
        </Box>
    )
})

export default ThemedEditor