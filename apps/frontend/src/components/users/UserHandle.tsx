import Typography, { TypographyProps } from "@mui/material/Typography";
import { forwardRef } from "react";

export type UserHandleProps = TypographyProps & { handle: string }

const UserHandle = forwardRef<HTMLParagraphElement, UserHandleProps>(({ handle, sx, ...props }, ref) => {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", ...sx }}
            ref={ref}
            {...props}
        >
            @{handle}
        </Typography>
    )
})

export default UserHandle