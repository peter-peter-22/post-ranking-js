import { useTheme } from "@mui/material/styles";
import { useCallback, useState } from "react";
import { getStandardGradient } from '../../../../utilities/getStandardGradient';
import GradientButton from "../../../buttons/GradientButton";
import { usePostFeedStore } from "../../../globalStore/postFeedStore";
import FloatingPostCreatorContainer from '../../../posts/FloatingPostContainer';
import PostCreator from "../../../posts/PostCreator";
import { updatePostFeedOnSubmit } from "../../../posts/onSubmit";

export default function PostButton() {
    const theme = useTheme()
    const gradient = getStandardGradient(theme)
    const [open, setOpen] = useState(false)
    const { queryKey, postId } = usePostFeedStore()
    const isCommentSection = queryKey ? queryKey[0] === "replies" : false

    const show = useCallback(() => {
        setOpen(true)
    }, [])

    const close = useCallback(() => {
        setOpen(false)
    }, [])

    return (
        <>
            <GradientButton
                gradient={gradient}
                size='large'
                fullWidth={true}
                sx={{ mt: 2 }}
                onClick={show}
            >
                {isCommentSection ? "Reply" : "Post"}
            </GradientButton>
            <FloatingPostCreatorContainer open={open} close={close}>
                <PostCreator
                    replyingTo={postId}
                    onPublish={(post) => {
                        updatePostFeedOnSubmit(post, queryKey || ["mainFeed"])
                        close()
                    }}
                />
            </FloatingPostCreatorContainer>
        </>
    )
}