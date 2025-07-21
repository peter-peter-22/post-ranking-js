import { useEffect, useRef } from "react";

type VisibilityObserverOptions = {
    onEnterScreen?: () => void
    onLeaveScreen?: () => void
    threshold?: number
}

export function useVisibilityObserver({ onEnterScreen, onLeaveScreen, threshold }: VisibilityObserverOptions) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (onEnterScreen) onEnterScreen();
                } else {
                    if (onLeaveScreen) onLeaveScreen();
                }
            },
            {
                threshold
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [onEnterScreen, onLeaveScreen, threshold]);

    return ref
}