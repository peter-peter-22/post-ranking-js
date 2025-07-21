import AdsClickIcon from '@mui/icons-material/AdsClick';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from 'react';
import { Post } from '../../../types/post';
import WhiteIconButton from '../../buttons/WhiteIconButton';
import { requirePost, useMainStore } from '../../globalStore/mainStore';
import LabelledIcon from '../../icons/LabelledIcon';
import FloatingPostCreatorContainer from '../FloatingPostContainer';
import { updatePostFeedOnSubmit } from '../onSubmit';
import { usePost } from '../PostContext';
import PostCreator from '../PostCreator';
import CopyPostLink from '../PostOptions/CopyPostLink';
import LikeButton from './LikeButton';
import { useVisibilityObserver } from '../../../hooks/useVisible';
import { addTrackedPost, removeTrackedPost } from '../../regularUpdates/updateMemory';

export default function PostButtons() {
    const { postId } = usePost()
    const ref = useVisibilityObserver({
        onEnterScreen: () => { addTrackedPost(postId) },
        onLeaveScreen: () => { removeTrackedPost(postId) },
        threshold: 0.5
    })
    return (
        <Stack direction={"row"} justifyContent={"space-between"} ref={ref}>
            <LikeButton />
            <ReplyButton />
            <ClickCounter />
            <ViewCounter />
            <ShareButton />
        </Stack>
    )
}

function ReplyButton() {
    const theme = useTheme()
    const { postId } = usePost()
    const replies = useMainStore(requirePost(postId, post => post.replies))
    const [open, setOpen] = useState(false)
    const show = useCallback(() => {
        setOpen(true)
    }, [])
    const close = useCallback(() => {
        setOpen(false)
    }, [])
    const onPublish = useCallback((post: Post) => {
        updatePostFeedOnSubmit(post, ["replies", postId])
        close()
    }, [close])
    return (
        <>
            <LabelledIcon
                iconButton={<WhiteIconButton idleColor={theme.palette.action.active} color="primary"><ChatBubbleOutlineOutlinedIcon /></WhiteIconButton>}
                label={<Typography variant="body2">{replies}</Typography>}
                onClick={show}
            />
            <FloatingPostCreatorContainer open={open} close={close}>
                <PostCreator
                    replyingTo={postId}
                    onPublish={onPublish}
                />
            </FloatingPostCreatorContainer>
        </>
    )
}

function ClickCounter() {
    const theme = useTheme()
    const { postId } = usePost()
    const clicks = useMainStore(requirePost(postId, post => post.clicks))
    return (
        <LabelledIcon
            iconButton={<IconButton disabled sx={{ color: `${theme.palette.action.active} !important` }}><AdsClickIcon /></IconButton>}
            label={<Typography variant="body2">{clicks}</Typography>}
        />
    )
}

function ViewCounter() {
    const theme = useTheme()
    const { postId } = usePost()
    const views = useMainStore(requirePost(postId, post => post.views))
    return (
        <LabelledIcon
            iconButton={<IconButton disabled sx={{ color: `${theme.palette.action.active} !important` }}><VisibilityOutlinedIcon /></IconButton>}
            label={<Typography variant="body2">{views}</Typography>}
        />
    )
}

function ShareButton() {
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <>
            <WhiteIconButton
                edge="end"
                idleColor={theme.palette.action.active}
                color="primary"
                onClick={handleClick}
            >
                <ShareOutlinedIcon />
            </WhiteIconButton>
            <Menu
                aria-describedby='post share menu'
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                onClick={handleClose}
            >
                <CopyPostLink />
            </Menu>
        </>
    )
}