import { useEffect, useState } from "react"

/** Check if the window is scrolled to the top, return true if yes. */
export default function useOnTop(threshold=1) {
    const [onTop, setOnTop] = useState(true)
    useEffect(() => {
        const handleScroll = () => {
            setOnTop(window.scrollY < threshold)
        }
        handleScroll()
        window.addEventListener("scroll", handleScroll)
        return () => { window.removeEventListener("scroll", handleScroll) }
    }, [])
    return onTop
}