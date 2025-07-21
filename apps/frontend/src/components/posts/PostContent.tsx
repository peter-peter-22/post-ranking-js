import DeleteIcon from '@mui/icons-material/Delete';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import Button from '@mui/material/Button';
import Stack, { StackProps } from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMutation } from '@tanstack/react-query';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { restorePost } from '../../api/posts/deletePost';
import { formatDate } from '../../utilities/formatDate';
import { requirePost, useMainStore } from '../globalStore/mainStore';
import PostMedia from '../media/PostMedia';
import SmallUserProfileFollow from '../users/SmallUserProfileFollow';
import { convertServerMedia } from './convertPostMedia';
import { PostEditorProvider } from './EditPostContext';
import PostButtons from './PostButtons';
import { usePost } from './PostContext';
import PostOptions from './PostOptions';
import { useVisibilityObserver } from '../../hooks/useVisible';
import { viewPost } from '../regularUpdates/updateMemory';
import PostTextViewer from './RichTextEditor/PostTextViewer';

export type PostContentProps = StackProps

const PostContent = memo((props: PostContentProps) => {
    const { postId } = usePost()
    const { media, text, createdAt, replyingTo, deleted } = useMainStore(useShallow(
        requirePost(postId, post => ({
            media: post.media,
            text: post.text,
            createdAt: post.createdAt,
            replyingTo: post.replyingTo,
            deleted: post.deleted
        }))
    ))
    const files = media ? convertServerMedia(media) : undefined
    const ref = useVisibilityObserver({
        onEnterScreen: () => { viewPost(postId) },
        threshold: 1
    })
    return deleted ? (
        <DeletedPost />
    ) : (
        <PostEditorProvider>
            <Stack gap={1} component="article" {...props} ref={ref}>
                {replyingTo &&
                    <ReplyingTo replyingTo={replyingTo} />
                }
                <SmallUserProfileFollow  >
                    <PostOptions />
                </SmallUserProfileFollow>
                {text !== null &&
                    <PostTextViewer value={text} />
                }
                {files &&
                    <PostMedia files={files} />
                }
                <Stack direction={"row"} alignItems={"center"} gap={1}>
                    <EventOutlinedIcon color="action" fontSize='small' />
                    <Typography variant="body2" color="textSecondary" >
                        {formatDate(createdAt)}
                    </Typography>
                </Stack>
                <PostButtons />
            </Stack>
        </PostEditorProvider>
    )
})

export function ReplyingTo({ replyingTo }: { replyingTo: string }) {
    const repliedUserHandle = useMainStore(state => {
        const repliedUserId = state.posts.get(replyingTo)?.userId
        if (!repliedUserId) return
        return state.users.get(repliedUserId)?.handle
    })
    return (
        <Stack direction={"row"} gap={1} alignItems={"center"}>
            <ReplyIcon fontSize='small' color='action' />
            <Typography variant='body2' color="textSecondary">
                {repliedUserHandle ? `Replying to @${repliedUserHandle}` : "Reply"}
            </Typography>
        </Stack>
    )
}

function DeletedPost() {
    const { postId } = usePost()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const newPost = await restorePost(postId)
            useMainStore.getState().addPosts([newPost])
        }
    })
    return (
        <Stack gap={1} alignItems={"center"} >
            <DeleteIcon color="action" />
            <Typography color="textSecondary">This post was deleted</Typography>
            <Button loading={isPending} onClick={() => mutate()}>Restore</Button>
        </Stack>
    )
}

export default PostContent