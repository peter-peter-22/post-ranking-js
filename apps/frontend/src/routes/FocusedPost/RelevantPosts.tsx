import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { getRelevantPosts } from "../../api/posts/feed";
import PostFeed, { PostFeedListComponentNoScroll, PostFeedProps } from "../../components/posts/PostFeed";

function Displayer(props: PostFeedProps) {
    return (
        <Stack gap={2}>
            <Title />
            <PostFeedListComponentNoScroll {...props} />
        </Stack>
    )
}

export default function RelevantPosts({ postId }: { postId: string }) {
    return (
        <PostFeed
            queryKey={["relevantPosts", postId]}
            queryFn={async (offset?: number) => {
                return await getRelevantPosts(postId, offset)
            }}
            ListComponent={Displayer}
        />
    )
}

function Title() {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5">
                Relevant posts
            </Typography>
        </Paper>
    )
}