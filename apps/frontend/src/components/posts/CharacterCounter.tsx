import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Control, useForm, useWatch } from 'react-hook-form';
import { getEffectiveLength } from "@me/schemas/postCharacterCounter"
import { PostFormData } from '@me/schemas/zod/createPost';

/** Count the effective length of the text of the post. */
export function useCharacterCounter(control: Control<PostFormData>) {
    const value = useWatch<PostFormData>({
        control,
        name: "text",
    })
    return getEffectiveLength(value as string)
}

/** Display the character count of the provided text. */
export default function CharacterCounter({  max }: {  max: number }) {
    const {control}=useForm<PostFormData>()
    const value=useCharacterCounter(control)
    const theme = useTheme()
    const progress = Math.min(value / max * 100, 100)
    const warning = progress >= 75
    const error = progress >= 100
    const color = error ? (
        theme.palette.error.main
    ) : warning ? (
        theme.palette.warning.main
    ) : (
        theme.palette.primary.main
    )
    return (
        <Box sx={{ position: "relative", display: "flex" }}>
            <CircularProgress
                variant="determinate"
                value={progress}
                sx={{
                    color: color
                }}
            />
            <CircularProgress
                variant="determinate"
                value={100}
                sx={{
                    opacity: theme.palette.action.activatedOpacity,
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0
                }}
                style={{
                    color: color
                }}
            />
            <Typography
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                }}
                style={{
                    display: warning ? "flex" : "none",
                }}
            >
                {Math.abs(max - value)}
            </Typography>
        </Box>
    )
}