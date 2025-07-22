import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { Link } from 'react-router-dom';
import { Trend } from '../../../../types/trend';
import { getTrendUrl } from '../../urls/trends';
import { formatNumber } from '../../utilities/formatNumber';

export type TrendDisplayerProps = { trend: Trend, index: number }

export default function TrendDisplayer({ trend: { keyword, category, postCount }, index }: TrendDisplayerProps) {
    const theme = useTheme()
    return (
        <Box
            sx={{
                textDecoration: "unset",
                color: "unset",
                "&:hover .trend-name": {
                    color: theme.palette.primary.main
                }
            }}
            component={Link}
            to={getTrendUrl(keyword)}
        >
            <Typography variant="body2" color={"textSecondary"} >
                {
                    category === "global" ? (
                        `#${index + 1} Trending`
                    ) : (
                        `#${index + 1} For you`
                    )
                }
            </Typography>
            <Typography
                fontWeight={theme.typography.fontWeightBold}
                className="trend-name"
                sx={{
                    transition: theme.transitions.create(["color"], { duration: theme.transitions.duration.shortest }),
                    textTransform: "capitalize"
                }}
            >
                {keyword}
            </Typography>
            <Typography variant="body2" color={"textSecondary"} >
                {formatNumber(postCount||0)} posts
            </Typography>
        </Box>
    )
}