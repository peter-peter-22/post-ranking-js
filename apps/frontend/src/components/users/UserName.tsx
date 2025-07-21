import Typography, { TypographyProps } from "@mui/material/Typography";
import { forwardRef } from "react";

export type UserNameProps = TypographyProps & { name: string }

const UserName = forwardRef<HTMLDivElement, UserNameProps>(({ name, sx, ...props }, ref) => {
    return (
        <Typography
            variant="body2"
            fontWeight="bold"
            sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", ...sx }}
            color="textPrimary"
            ref={ref}
            {...props}
        >
            {name}
        </Typography>
    )
})

export default UserName