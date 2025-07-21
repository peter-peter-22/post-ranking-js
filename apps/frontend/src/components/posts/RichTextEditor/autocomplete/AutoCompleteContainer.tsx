import { useTheme } from "@mui/material/styles";
import Fade from '@mui/material/Fade';
import Popper, { PopperProps } from '@mui/material/Popper';
import { forwardRef, ReactElement } from 'react';

export type RichTextAutocompleteContainerProps = Omit<PopperProps, "children"> & {
    children: ReactElement
}

const RichTextAutocompleteContainer = forwardRef<HTMLDivElement, RichTextAutocompleteContainerProps>(
    ({
        children,
        popperOptions = {
            placement: "bottom"
        },
        contentEditable = false,
        transition = true,
        sx,
        ...props
    }, ref) => {
        const theme = useTheme()
        return (
            <Popper
                {...{
                    popperOptions,
                    contentEditable,
                    transition
                }}
                {...props}
                ref={ref}
                sx={{
                    ...sx,
                    zIndex:theme.zIndex.tooltip
                }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps}>
                        {children}
                    </Fade>
                )}
            </Popper>
        )
    }
)

export default RichTextAutocompleteContainer;
