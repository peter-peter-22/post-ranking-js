import { BoxProps } from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { alpha, useTheme } from "@mui/material/styles";
import useOnTop from "../../../hooks/useOnTop";
import LayoutBox from "../mainLayout/LayoutBox";

/** Sticky suface with blurry background and dynamic width for containing top navigation. */
export default function TopNavBar({ children, sx, ...props }: BoxProps) {
    const theme = useTheme()
    const onTop = useOnTop(10)
    return (
        <LayoutBox
            component="nav"
            sx={{
                position: "sticky",
                top: 0,
                zIndex: theme.zIndex.appBar,
                ...sx
            }}
            {...props}
        >
            <Paper
                sx={{
                    overflow: "hidden",
                    mx: onTop ? 0 : 1,
                    transition: theme.transitions.create(["padding", "margin"], { duration: theme.transitions.duration.shortest }),
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: "blur(10px)",
                }}
            >
                {children}
            </Paper>
        </LayoutBox>
    )
}