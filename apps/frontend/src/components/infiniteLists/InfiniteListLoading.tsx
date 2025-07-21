import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

/** Standard loading indicator for infinite lists. */
export default function InfiniteListLoading() {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", m: 2 }}>
            <CircularProgress />
        </Box>
    )
}