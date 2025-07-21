import { ButtonProps } from '@mui/material/Button';
import { Theme } from '@mui/material/styles';

export type Gradient = {
    start: string;
    middle: string;
    end: string;
    fallbackColor: ButtonProps["color"];
}

/** The standard gradient used accross the app. */
export function getStandardGradient(theme: Theme): Gradient {
    return {
        start: theme.palette.primaryLeft.main,
        middle: theme.palette.primary.main,
        end: theme.palette.primaryRight.main,
        fallbackColor: "primary"
    }
}