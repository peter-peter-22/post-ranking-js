import Stack from "@mui/material/Stack";
import { getMainFeed } from "../../api/posts/feed";
import { updatePostFeedOnSubmit } from "../../components/posts/onSubmit";
import PostCreator from "../../components/posts/PostCreator";
import PostCreatorContainer from "../../components/posts/PostCreatorContainer";
import PostFeed from "../../components/posts/PostFeed";
import { usePostFeed } from "../../components/posts/usePostFeed";

export default function MainFeedPosts() {
    const queryKey = ["mainFeed"]
    usePostFeed(queryKey)
    return (
        <Stack gap={2}>
            <PostCreatorContainer>
                <PostCreator
                    onPublish={(post) => { updatePostFeedOnSubmit(post, queryKey) }}
                />
            </PostCreatorContainer>
            <PostFeed
                queryKey={queryKey}
                queryFn={getMainFeed}
            />
        </Stack>
    )
}