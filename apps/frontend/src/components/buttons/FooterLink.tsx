import Link, { LinkProps } from "@mui/material/Link";

/** Standard link used in the footer */
export default function FooterLink({ color = "textSecondary", fontSize = "small", children, ...props }: LinkProps) {
    return (
        <Link color={color} fontSize={fontSize} {...props}>
            {children}
        </Link>
    )
}