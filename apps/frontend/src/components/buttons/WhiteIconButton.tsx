import { useTheme } from '@mui/material';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';

export type WhiteIconButtonProps = IconButtonProps & {
    idleColor: string;
    highlighted?: boolean
};

/** Icon button with alternative color when not hovered. */
export default function WhiteIconButton({ idleColor, highlighted, children, sx, ...props }: WhiteIconButtonProps) {
    const theme = useTheme()
    return (
        <IconButton
            className={highlighted ? 'activated' : ''}
            sx={{
                ...sx,
                "&:not(:hover):not(.activated)": { color: idleColor },
                transition: theme.transitions.create("all", { duration: theme.transitions.duration.shortest })
            }}
            {...props}
        >
            {children}
        </IconButton>
    )
}