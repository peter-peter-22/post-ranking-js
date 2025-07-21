import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import TopNavBar from "../../components/layout/tabs/TopTabSelector";
import PostDisplayer from "../../components/posts/Post";
import { PostProvider } from '../../components/posts/PostContext';
import CommentSectionPosts from './CommentSection';
import PostDisplayerFocusable from '../../components/posts/FocusablePost';

export default function FocusedPostPage({ postId,repliedId }: { postId: string, repliedId: string | null }) {
    const navigate = useNavigate()
    return (
        <>
            <TopNavBar sx={{ "& .MuiPaper-root": { borderRadius: 999 } }}>
                <Stack direction={"row"} sx={{ p: 1 }} gap={2} alignItems={"center"}>
                    <IconButton onClick={() => { navigate(-1) }}>
                        <NavigateBeforeOutlinedIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                        Post
                    </Typography>
                </Stack>
            </TopNavBar>
            <Stack gap={2}>
                {repliedId &&
                    <PostProvider postId={repliedId}>
                        <PostDisplayerFocusable />
                    </PostProvider>
                }
                <PostProvider postId={postId}>
                    <PostDisplayer />
                </PostProvider>
                <CommentSectionPosts postId={postId} />
            </Stack>
        </>
    )
}