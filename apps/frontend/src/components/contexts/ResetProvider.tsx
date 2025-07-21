import { createContext, ReactNode, useCallback, useContext, useState } from "react";

type ResetContextType = {
    reset: () => void
}

const ResetContext = createContext<ResetContextType | undefined>(undefined)

export function ResetProvider({ children }: { children: ReactNode }) {
    const [version, setVersion] = useState(0)
    const reset = useCallback(() => {
        setVersion(v => v + 1)
    }, [])
    return (
        <ResetContext.Provider value={{ reset }} key={version}>
            {children}
        </ResetContext.Provider>
    )
}

export function useReset() {
    const data = useContext(ResetContext);
    if (!data) throw new Error("Missing ResetProvider")
    return data
}