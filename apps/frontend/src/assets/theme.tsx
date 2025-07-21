import { createTheme, PaletteColor, PaletteColorOptions, responsiveFontSizes } from '@mui/material/styles';
import { forwardRef } from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";

declare module '@mui/material/styles' {
    interface Palette {
        primaryLeft: PaletteColor;
        primaryRight: PaletteColor;
        backgroundLeft: PaletteColor;
        backgroundRight: PaletteColor;
    }
    interface PaletteOptions {
        primaryLeft?: PaletteColorOptions;
        primaryRight?: PaletteColorOptions;
        backgroundLeft?: PaletteColorOptions;
        backgroundRight?: PaletteColorOptions;
    }
    interface BreakpointOverrides {
        xs: true;
        sm: true;
        md: true;
        lg: true;
        xl: true;
        middle: true;
    }
}

const LinkBehavior = forwardRef<
    HTMLAnchorElement,
    Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to'] }
>((props, ref) => {
    const { href, ...other } = props;
    // Map href (Material UI) -> to (react-router)
    return <RouterLink ref={ref} to={href} {...other} />;
});

export let theme = createTheme({

    //palette

    palette: {
        mode: 'light',
        primary: {
            main: "hsl(225, 100%, 63.10%)"
        },
        secondary: {
            main: "hsl(226, 39.30%, 23.90%)"
        },
        background: {
            default: "hsl(225, 100%, 96.07%)",
            paper: "#FFF"
        },
        divider: "hsl(225, 43%, 79%)",
    },

    //colos schemes

    colorSchemes: {
        dark: true
    },

    //shape

    shape: {
        borderRadius: 15,
    },

    //breakpoints

    breakpoints: {
        values: {
            xs: 0,
            sm: 500,
            middle: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },

    //shadows

    shadows: ["none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none"],

    //typography

    typography: {
        h1: {
            fontSize: "3.5rem",
            fontWeight: "bold"
        },
        h2: {
            fontSize: "3.0rem",
            fontWeight: "bold"
        },
        h3: {
            fontSize: "2.5rem",
            fontWeight: "bold"
        },
        h4: {
            fontSize: "2.0rem",
            fontWeight: "bold"
        },
        h5: {
            fontSize: "1.5rem",
            fontWeight: "bold"
        },
        h6: {
            fontSize: "1.5rem",
            fontWeight: "normal"
        },
        button: {
            textTransform: 'none',
            fontWeight: "bold"
        },
    },

    //components

    components: {
        MuiPaper: {
            defaultProps: {
                variant: "outlined"
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: "outlined"
            }
        },
        MuiLink: {
            defaultProps: {
                component: LinkBehavior,
                underline: "hover"
            }
        },
        MuiButtonBase: {
            defaultProps: {
                LinkComponent: LinkBehavior
            }
        }
    }
})

//responsive font sizes

theme = responsiveFontSizes(theme, { factor: 5 });

//component overrides

theme.components = {
    ...theme.components,
    MuiFab: {
        styleOverrides: {
            root: {
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(2),
            }
        }
    }
}

//color overrides

theme.palette = {
    ...theme.palette,
    primaryLeft: theme.palette.augmentColor({ color: { main: "hsl(245, 100%, 63.10%)" } }),
    primaryRight: theme.palette.augmentColor({ color: { main: "hsl(205, 100%, 63.10%)" } }),
    backgroundLeft: theme.palette.augmentColor({ color: { main: "hsl(185, 100%, 96.07%)" } }),
    backgroundRight: theme.palette.augmentColor({ color: { main: "hsl(265, 100%, 96.07%)" } }),
}