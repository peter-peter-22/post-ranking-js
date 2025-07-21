import { alpha, useTheme } from "@mui/material/styles";
import IconButton, { IconButtonProps } from '@mui/material/IconButton';

/** Icon button with dark background and white color. */
export default function AltIconButton({ children, sx, ...props }: IconButtonProps) {
    const theme = useTheme()
    return (
        <IconButton
            sx={{
                ...sx,
                color: theme.palette.common.white,
                transition: theme.transitions.create("color", { duration: theme.transitions.duration.shortest }),
                "&:hover": {
                    color: alpha(theme.palette.common.white, theme.palette.action.disabledOpacity),
                },
                "&:hover, &":{
                    backgroundColor: theme.palette.action.active,
                }
            }}
            {...props}
        >
            {children}
        </IconButton>
    )
}