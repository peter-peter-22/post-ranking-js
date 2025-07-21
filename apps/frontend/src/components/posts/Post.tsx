import Paper, { PaperProps } from "@mui/material/Paper";
import PostContent from "./PostContent";

export type PostProps = PaperProps

export default function PostDisplayer({ sx, ...props }: PostProps) {
    return (
        <Paper sx={{ ...sx, p: 2 }} {...props}>
            <PostContent />
        </Paper>
    )
}