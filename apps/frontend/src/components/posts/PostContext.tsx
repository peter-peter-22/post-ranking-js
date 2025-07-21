import { createContext, ReactNode, useContext } from "react";
import { useMainStore } from "../globalStore/mainStore";
import { UserProvider } from "../users/UserContext";

type PostContextType = {
    postId: string,
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export type PostProviderProps = { children: ReactNode, postId: string }

export function PostProvider({ children, postId }: PostProviderProps) {
    const userId = useMainStore(state=>state.posts.get(postId)?.userId)
    if(!userId) throw new Error("User or post doesn't exists in zustand.")
    return (
        <PostContext.Provider value={{ postId}} key={postId}>
            <UserProvider userId={userId}>
                {children}
            </UserProvider>
        </PostContext.Provider>
    )
}

export function usePost() {
    const context = useContext(PostContext)
    if (!context) throw new Error("No PostContext found")
    return context
}