import { useTheme } from "@mui/material/styles";
import TransparentNavLink, { TransparentNavlinkProps } from "./TransparentNavLink"
import { ReactNode } from "react"

export type HeaderNavLinkProps = Omit<TransparentNavlinkProps, "activeColor" | "inactiveColor"> & {
    icon: ReactNode
}

/** Standard header link */
export default function HeaderNavLink({ to, children, icon, ...props }: HeaderNavLinkProps) {
    const theme = useTheme()
    return (
        <TransparentNavLink
            {...props}
            activeColor={theme.palette.primary}
            inactiveColor={theme.palette.secondary}
            to={to}
            buttonProps={{
                startIcon: icon,
                fullWidth: true,
                size: "large",
                sx: {
                    justifyContent: "start"
                }
            }}
        >
            {children}
        </TransparentNavLink>
    )
}