import Box, { BoxProps } from "@mui/material/Box";
import { ReactNode } from "react";

type LabelledIconProps = BoxProps & {
    iconButton: ReactNode,
    label: ReactNode
}

export default function LabelledIcon({ iconButton, label, sx, ...props }: LabelledIconProps) {
    return (
        <Box sx={{ position: "relative", ...sx }} {...props}>
            {iconButton}
            <Box
                sx={{
                    position: "absolute",
                    left: "100%",
                    top: "50%",
                    transform: "translateY(-50%)"
                }}>
                {label}
            </Box>
        </Box>
    )
}