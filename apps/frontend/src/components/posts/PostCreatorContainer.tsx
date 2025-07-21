import Paper, { PaperProps } from "@mui/material/Paper";

/** Paper container for the post creator form. */
export default function PostCreatorContainer({ children, sx, ...props }: PaperProps) {
    return (
        <Paper sx={{ overflow: "hidden", ...sx }} {...props}>
            {children}
        </Paper>
    )
}