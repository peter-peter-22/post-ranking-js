import { PaletteColor } from '@mui/material/styles';
import { ReactNode } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import TransparentButton, { TransparentButtonProps } from "./TransparentButton";

export type TransparentNavlinkProps = NavLinkProps & {
    buttonProps?: Omit<TransparentButtonProps, "color">,
    inactiveColor: PaletteColor,
    activeColor: PaletteColor,
    children: ReactNode
}

/** Transparent button with navlink behaviour and dynamic styling */
export default function TransparentNavLink({ buttonProps, inactiveColor, activeColor, children, ...props }: TransparentNavlinkProps) {
    return (
        <NavLink {...props}>
            {({ isActive }) => (
                <TransparentButton
                    color={isActive ? activeColor : inactiveColor}
                    selected={isActive}
                    {...buttonProps}
                >
                    {children}
                </TransparentButton>
            )}
        </NavLink>
    )
}