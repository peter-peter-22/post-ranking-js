import { alpha, useTheme } from "@mui/material/styles";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPostUrl } from "../../urls/posts";
import { requireUser, useMainStore } from "../globalStore/mainStore";
import { useUser } from "../users/UserContext";
import PostDisplayer, { PostProps } from "./Post";
import { usePost } from "./PostContext";
import { clickPost } from "../regularUpdates/updateMemory";

export default function PostDisplayerFocusable({ sx, ...props }: PostProps) {
    const { postId } = usePost()
    const {userId} = useUser()
    const userHandle=useMainStore(requireUser(userId, user => user.handle))
    const theme = useTheme()
    const navigation = useNavigate()
    const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Open the post on direct click
        const directClick = e.target === e.currentTarget
        if (!directClick) return
        navigation(getPostUrl(postId, userHandle))
        clickPost(postId)
    }, [postId, userHandle])
    return (
        <PostDisplayer
            {...props}
            sx={{
                ...sx,
                cursor: 'pointer',
                outlineColor: "transparent",
                outlineStyle: "solid",
                outlineWidth: 2,
                transition: theme.transitions.create(["outline-color"], { duration: theme.transitions.duration.shortest }),
                "&:hover": {
                    outlineColor: alpha(theme.palette.primary.light, 0.5),
                },
                "&>*": {
                    pointerEvents: 'none',
                },
                "img,a,video,button": {
                    pointerEvents: 'all',
                }

            }}
            onClick={onClick}
        />
    )
}