import { createContext, ReactNode, useCallback, useContext, useState } from "react"

type ConfirmDialogContextType = { show: (renderer: ConfirmDialogRenderer) => void, close: () => void }

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

type ConfirmDialogRenderer = (close: () => void) => ReactNode

export function ConfirmDialogProvider({ children, }: { children: ReactNode }) {
    const [content, setContent] = useState<ConfirmDialogRenderer>()

    const show = useCallback((renderer: ConfirmDialogRenderer) => {
        setContent(() => renderer)
    }, [])

    const close = useCallback(() => {
        setContent(undefined)
    }, [])

    return (
        <>
            <ConfirmDialogContext.Provider value={{ show, close }}>
                {children}
            </ConfirmDialogContext.Provider>
            {content && content(close)}
        </>
    )
}

export function useConfirmDialog() {
    const context = useContext(ConfirmDialogContext)
    if (!context) throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider")
    return context
}