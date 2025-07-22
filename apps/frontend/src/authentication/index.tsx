import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { clearUserHandle, getUserHandle, setUserHandle } from "../api/api";
import { authenticate, CommonData } from "../api/authentication/authenticate";
import { useSnackbar } from "notistack";
import { formatError } from "../utilities/formatError";
import { User } from "@me/schemas/src/zod/user";

type AuthContextType = {
    user: User | undefined,
    setUser: (user: User) => void,
    logout: () => void,
    login: (userHandle: string) => void
    loading: boolean,
    common: CommonData | undefined,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [common, setCommon] = useState<CommonData | undefined>()
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        const userHandle = getUserHandle()
        if (!userHandle) {
            setLoading(false)
            return
        }
        authenticate(userHandle)
            .then(({ user, common }) => {
                setUser(user)
                setCommon(common)
            })
            .catch((error) => {
                console.error("Error while authenticating", error)
                const message = formatError(error)
                enqueueSnackbar(message, { variant: "error" })
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const logout = useCallback(() => {
        clearUserHandle()
        setUser(undefined)
        setCommon(undefined)
    }, [])

    const login = useCallback(async (userHandle: string) => {
        try {
            const { user, common } = await authenticate(userHandle)
            setUser(user)
            setCommon(common)
            setUserHandle(userHandle)
        }
        catch (e) {
            console.error("Error while logging in", e)
            throw e
        }
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            loading,
            login,
            logout,
            common
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const auth = useContext(AuthContext)
    if (!auth) throw new Error("useAuth must be used within an AuthProvider")
    return auth
}

export const useAuthStrict = () => {
    const { user, ...data } = useAuth()
    if (!user) throw new Error("Missing user")
    return { user, ...data }
}