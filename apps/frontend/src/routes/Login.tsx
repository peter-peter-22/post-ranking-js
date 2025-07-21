import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, LoginSchema } from "@me/schemas/src/zod/createUser";
import PublicIcon from '@mui/icons-material/Public';
import StarIcon from '@mui/icons-material/Star';
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import InputAdornment from '@mui/material/InputAdornment';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../assets/svg/Logo';
import { useAuth } from '../authentication';
import GradientButton from '../components/buttons/GradientButton';
import FormTextField from '../components/inputs/FormTextField';
import { formatError } from '../utilities/formatError';
import { getStandardGradient } from '../utilities/getStandardGradient';

export default function Login() {
    // Authentication
    const { login } = useAuth()

    // Theme
    const theme = useTheme()
    const gradient = getStandardGradient(theme)
    const { enqueueSnackbar } = useSnackbar()

    // Router
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get("redirectUrl") || "/home";

    // Form
    const methods = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
    });
    const { handleSubmit, formState: { isSubmitting } } = methods;
    const onSubmit = async (data: LoginFormData) => {
        console.log("Login form", data)
        try {
            await login(data.userHandle)
            navigate(redirectUrl)
        }
        catch (e) {
            enqueueSnackbar(formatError(e), { variant: "error" })
        }
    }

    return (
        <Box
            component="main"
            sx={{
                minHeight: "100dvh",
                display: "flex",
                alignItems: "center",
                background: `linear-gradient(45deg, ${theme.palette.backgroundLeft.main} 0%,${theme.palette.background.default} 30%,${theme.palette.background.default} 70%,${theme.palette.backgroundRight.main} 100%)`,
                py: 2
            }}
        >
            <Container maxWidth={"sm"} component="form" onSubmit={handleSubmit(onSubmit)}>
                <FormProvider {...methods}>
                    <Stack gap={2}>
                        <Box sx={{
                            borderRadius: "100%",
                            background: `linear-gradient(45deg, ${gradient.start}, ${gradient.middle}, ${gradient.end})`,
                            mx: "auto",
                            display: "flex"
                        }}>
                            <Logo
                                sx={{
                                    fontSize: 100,
                                    color: theme.palette.primary.contrastText,
                                }}
                            />
                        </Box>
                        <div>
                            <Typography
                                variant='h2'
                                textAlign={"center"}
                                sx={{
                                    background: `linear-gradient(45deg, ${gradient.start}, ${gradient.middle}, ${gradient.end})`,
                                    backgroundClip: "text",
                                    color: "transparent"
                                }}
                            >
                                Welcome to Y2!
                            </Typography>
                            <Typography variant="h6" color="textSecondary" component={"p"} textAlign={"center"} >
                                Your digital universe awaits
                            </Typography>
                        </div>
                        <Paper sx={{ p: 2 }} elevation={5}>
                            <Stack direction="row" alignItems="center" justifyContent={"center"} gap={1}>
                                <StarIcon color="primary" fontSize='large' />
                                <Typography variant="h5" textAlign={"center"} component="h3">
                                    Connect instantly
                                </Typography>
                            </Stack>
                            <Typography color="textSecondary" textAlign={"center"}>Join thousands of conversations</Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }} variant={"outlined"}>
                            <Stack direction="row" alignItems="center" justifyContent={"center"} gap={1}>
                                <PublicIcon color="primary" fontSize='large' />
                                <Typography variant="h5" textAlign={"center"} component="h3">
                                    Be discovered
                                </Typography>
                            </Stack>
                            <Typography color="textSecondary" textAlign={"center"}>Share your story with everyone</Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                            <Stack gap={2}>
                                <div>
                                    <Typography variant="h4" component="h3" textAlign={"center"}>
                                        Enter your universe
                                    </Typography>
                                    <Typography color="textSecondary" textAlign={"center"}>
                                        One username is all it takes to join the conversation
                                    </Typography>
                                </div>
                                <FormTextField
                                    name="userHandle"
                                    label="Your user handle"
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">@</InputAdornment>,
                                        },
                                    }}
                                />
                                <GradientButton
                                    gradient={gradient}
                                    fullWidth
                                    size='large'
                                    type="submit"
                                    loading={isSubmitting}
                                    loadingPosition="end"
                                >
                                    Share your story with everyone
                                </GradientButton>
                            </Stack>
                        </Paper>
                    </Stack>
                </FormProvider>
            </Container>
        </Box>
    )
}
