import { ReactNode, useEffect, useRef, useState } from "react";

export default function ClampedFollow({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const scrollPrevRef = useRef(0);
    const scrollingDownRef = useRef(false);
    const [scrollingDown, setScrollingDown] = useState(false);
    const [offset, setOffset] = useState(0);//the height of the empty space above the sticky div

    //the threshold where the sticky div will start following the screen.
    //equal to the max overflow height
    const height = ref.current ? ref.current.offsetHeight - window.innerHeight : 0;
    const tooSmall = ref.current ? ref.current.offsetHeight <= window.innerHeight : true;

    //decide if the sticky div should stick to the op or bottom
    const position = scrollingDown ?
        { top: -height } :
        { bottom: -height };

    //return true if the sticky div will be un-stucked by the current scroll
    function unstuck(scrollDown: boolean) {
        if (!ref.current) return

        const threshold = 1;
        const rect = ref.current.getBoundingClientRect();
        if (scrollDown) {
            //if sticked to the top, and scrolling down, will unstuck
            const reachedTop = Math.abs(rect.top) < threshold;
            return reachedTop;
        }
        else {
            //if sticked to the bottom, and scrolling up, will unstuck
            const reachedBottom = Math.abs(rect.bottom - window.innerHeight) < threshold;
            return reachedBottom;
        }
    }

    //update offset and stick direction on scroll
    useEffect(() => {
        function onScroll() {
            if (!ref.current) return

            //calculate scroll direction
            const scrollCurrent = window.scrollY;
            const scrollDelta = scrollCurrent - scrollPrevRef.current;
            const scrolledDown = scrollDelta > 0;
            scrollPrevRef.current = scrollCurrent;
            scrollingDownRef.current = scrolledDown;
            setScrollingDown(scrolledDown);

            //when un-stuck, calculate the offset
            const unstucking = unstuck(scrolledDown);
            if (unstucking) {
                //decide the offset height after un-stuck, based on the scrolling direction
                let height = scrollCurrent;
                if (!scrolledDown)
                    height -= (ref.current.offsetHeight - window.innerHeight);

                setOffset(Math.max(height, 0));
            }
        }

        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    //render the container depenting on the scaling mode
    return (
        <div style={{ height: "100%" }}>
            {!tooSmall && <div style={{ height: offset }} />}
            <div
                ref={ref}
                style={{
                    position: "sticky",
                    ...(tooSmall ? { top: 0 } : position)
                }}
            >
                {children}
            </div>
        </div>
    );
}
