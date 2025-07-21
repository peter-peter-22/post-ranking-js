import Box, { BoxProps } from "@mui/material/Box";

/** Container for the elements of the main layout with a padding. */
export default function LayoutBox({ children, sx, ...props }: BoxProps) {
    return (
        <Box sx={{ py: 2, ...sx }} {...props}>
            {children}
        </Box>
    )
}