import { InputHTMLAttributes, ReactNode, useCallback, useRef } from "react"

export type StyledFileInputProps = InputHTMLAttributes<HTMLInputElement> & {
    render: ({ }: { onClick: () => void }) => ReactNode,
}

/** Wrapper to use the click event of a file input on another component. */
export default function StyledFileInput({ render, type = "file", ...inputProps }: StyledFileInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const onClick = useCallback(() => {
        if (!inputRef.current) return
        inputRef.current.click()
    }, [inputRef])
    return <>
        <input
            {...inputProps}
            type={type}
            ref={inputRef}
            style={{ display: "none" }}
        />
        {render({ onClick })}
    </>
}