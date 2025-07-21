import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Button from '@mui/material/Button';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAuth } from '../../../../../authentication';
import TrendDisplayer from '../../../../trends/TrendDisplayer';

export default function TrendsPreview() {
    const data = useAuth()
    const trends = data.common?.trends
    return trends && (
        <Paper
            component={"aside"}
            sx={{
                p: 2,
            }}
        >
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} gap={1} sx={{ mb: 4 }}>
                <Typography variant={"h5"} component={"h3"}>
                    Trending
                </Typography>
                <TrendingUpIcon fontSize={"large"} color="primary" />
            </Stack>
            <Stack gap={2}>
                {trends.map((trend, index) => (
                    <TrendDisplayer key={index} trend={trend} index={index} />
                ))}
                <Button href="/trends" >Show more</Button>
            </Stack>
        </Paper>
    )
}