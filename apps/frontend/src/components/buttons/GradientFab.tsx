import Box from '@mui/material/Box';
import Fab, { FabProps } from '@mui/material/Fab';
import { useTheme } from "@mui/material/styles";
import { Gradient } from '../../utilities/getStandardGradient';

export type GradientFabProps = Omit<FabProps, "color"> & {
    gradient: Gradient
}

/** Fab with gradient background. */
export default function GradientFab({ children, gradient, sx, ...props }: GradientFabProps) {
    const theme = useTheme()
    const tonalOffset = theme.palette.tonalOffset.valueOf() as number
    return (
        <Fab
            color={gradient.fallbackColor}
            sx={{
                backgroundColor: "transparent",
                position: "relative",
                overflow: "hidden",
                "&:hover .gradient": {
                    filter: `brightness(${1 - tonalOffset})`
                },
                ...sx,
            }}
            {...props}
        >
            <Box
                className="gradient"
                sx={{
                    background: `linear-gradient(45deg, ${gradient.start}, ${gradient.middle}, ${gradient.end})`,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    transition: theme.transitions.create(["all"], { duration: theme.transitions.duration.short }),
                    zIndex: -1,
                }}
            />
            {children}
        </Fab>
    )
}