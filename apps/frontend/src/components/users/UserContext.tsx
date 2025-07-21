import { createContext, ReactNode, useContext } from "react"

export type UserContextType = {
    userId: string,
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export type UserProviderProps = {
    children: ReactNode,
    userId: string,
}

export function UserProvider({ children, userId }: UserProviderProps) {
    return (
        <UserContext.Provider value={{ userId }} key={userId}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) throw new Error("No UserContext found")
    return context
}