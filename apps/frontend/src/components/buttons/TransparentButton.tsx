import Button, { ButtonProps } from "@mui/material/Button";
import { alpha, PaletteColor, useTheme } from '@mui/material/styles';

export type TransparentButtonProps = Omit<ButtonProps, "color"> & {
    selected?: boolean;
    color: PaletteColor
}

/** Selectable button designed for nativation. The background is transparent unless hovered or selected. */
export default function TransparentButton({ children, selected, sx, color, ...props }: TransparentButtonProps) {
    const theme = useTheme()
    return <Button
        variant={"contained"}
        disableElevation={true}
        {...props}
        sx={{
            backgroundColor: alpha(color.light, selected ? theme.palette.action.selectedOpacity : 0),
            color: color.main,
            "&:hover": {
                backgroundColor: alpha(
                    color.light,
                    selected ? theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity : theme.palette.action.hoverOpacity
                ),
                color: color.dark,
            },
            ...sx
        }}>
        {children}
    </Button>
}
