import { SxProps } from "@mui/material/styles";
import { Gradient } from "../../utilities/getStandardGradient";
import Logo from "./Logo";

export default function GradientLogo({ gradient, sx }: { sx?: SxProps, gradient: Gradient }) {
    return (
        <>
            <svg width="0" height="0">
                <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="10%" stopColor={gradient.start} />
                    <stop offset="50%" stopColor={gradient.middle} />
                    <stop offset="90%" stopColor={gradient.end} />
                </linearGradient>
            </svg>
            <Logo sx={{
                '& path': {
                    fill: 'url(#logoGradient)',
                },
                ...sx
            }} />
        </>
    )
}
