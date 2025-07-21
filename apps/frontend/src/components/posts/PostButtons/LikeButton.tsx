import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useShallow } from 'zustand/react/shallow';
import { likePost } from '../../../api/posts/like';
import { useOptimisticToggle } from '../../../hooks/useOptimisticUpdate';
import WhiteIconButton from '../../buttons/WhiteIconButton';
import { requirePost, useMainStore } from '../../globalStore/mainStore';
import LabelledIcon from '../../icons/LabelledIcon';
import { usePost } from '../PostContext';

export default function LikeButton() {
    const { postId } = usePost()
    const { likes, liked } = useMainStore(useShallow(
        requirePost(postId, post => ({
            likes: post.likes,
            liked: post.liked
        }))
    ))
    const theme = useTheme()
    const { toggle: handleLike } = useOptimisticToggle({
        mutateValue: async (value) => { await likePost(postId, value) },
        onToggle: (value) => {
            useMainStore.getState().updatePost(
                postId,
                post=>({...post,liked: value, likes: post.likes + (value ? 1 : -1)})
            )
        },
        currentValue: liked
    })
    return (
        <LabelledIcon
            onClick={handleLike}
            iconButton={
                <WhiteIconButton
                    edge="start"
                    idleColor={theme.palette.action.active}
                    color="primary"
                    highlighted={liked}
                >
                    <FavoriteBorderIcon />
                </WhiteIconButton>
            }
            label={<Typography variant="body2">{likes}</Typography>}
        />
    )
}
