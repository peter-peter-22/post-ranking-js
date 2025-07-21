import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useShallow } from 'zustand/react/shallow';
import { Post, PostToEdit } from "../../types/post";
import { requirePost, useMainStore } from "../globalStore/mainStore";
import FloatingPostCreatorContainer from "./FloatingPostContainer";
import { usePost } from "./PostContext";
import PostCreator from "./PostCreator";

type EditPostContextType = {
    show: () => void,
    close: () => void
}

const EditPostContext = createContext<EditPostContextType | undefined>(undefined)

export function PostEditorProvider({ children }: { children: ReactNode }) {
    const { postId } = usePost()
    const [open, setOpen] = useState(false)
    const postToEdit: PostToEdit = useMainStore(useShallow(requirePost(postId, post => ({
        id: post.id,
        text: post.text,
        media: post.media,
        replyingTo: post.replyingTo
    }))))

    const show = useCallback(() => {
        setOpen(true)
    }, [])

    const close = useCallback(() => {
        setOpen(false)
    }, [])

    const onPublish = useCallback((post: Post) => {
        useMainStore.getState().updatePost(post.id, (old) => ({ ...old, ...post }))
        close()
    }, [close])

    return (
        <>
            <EditPostContext.Provider value={{ show, close }}>
                {children}
            </EditPostContext.Provider>
            <FloatingPostCreatorContainer open={open} close={close}>
                <PostCreator
                    replyingTo={postId}
                    onPublish={onPublish}
                    post={postToEdit}
                />
            </FloatingPostCreatorContainer>
        </>
    )
}

export function usePostEditor() {
    const data = useContext(EditPostContext)
    if (!data) throw new Error("No post editor context")
    return data
}