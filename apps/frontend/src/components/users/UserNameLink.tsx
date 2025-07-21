import Link, { LinkProps } from "@mui/material/Link";
import { forwardRef } from "react";
import { getUserUrl } from "../../urls/user";

export type UserNameProps = LinkProps & { handle: string, name: string }

const UserNameLink = forwardRef<HTMLAnchorElement, UserNameProps>(({ handle, name, sx, ...props }, ref) => {
    return (
        <Link
            variant="body2"
            fontWeight="bold"
            sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", ...sx }}
            color="textPrimary"
            ref={ref}
            href={getUserUrl(handle)}
            {...props}
        >
            {name}
        </Link>
    )
})

export default UserNameLink