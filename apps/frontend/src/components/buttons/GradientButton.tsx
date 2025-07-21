import Box from '@mui/material/Box';
import Button, { ButtonProps } from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { Gradient } from '../../utilities/getStandardGradient';

export type GradientButtonProps = Omit<ButtonProps, "variant" | "color"> & {
    gradient: Gradient
}

/** Button with gradient background. */
export default function GradientButton({ children, gradient, sx, ...props }: GradientButtonProps) {
    const theme = useTheme()
    const tonalOffset = theme.palette.tonalOffset.valueOf() as number
    return (
        <Button
            variant='contained'
            color={gradient.fallbackColor}
            sx={{
                backgroundColor: "transparent",
                position: "relative",
                overflow: "hidden",
                zIndex: theme.zIndex.fab,
                "&:hover .gradient": {
                    filter: `brightness(${1 - tonalOffset})`
                },
                "&.Mui-disabled .gradient": {
                    opacity: theme.palette.action.disabledOpacity
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
        </Button>
    )
}