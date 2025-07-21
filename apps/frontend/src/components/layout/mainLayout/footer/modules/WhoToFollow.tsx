import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import Button from '@mui/material/Button';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SmallUserProfileFollow from "../../../../users/SmallUserProfileFollow";
import { UserProvider } from "../../../../users/UserContext";
import { useAuth } from '../../../../../authentication';

/** Display a list of recommended users to follow. */
export default function WhoToFollow() {
    const data = useAuth()
    const userIds = data.common?.whoToFollow
    return userIds && userIds.length > 0 && (
        <Paper component="aside" sx={{ p: 2 }}>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} gap={1} sx={{ mb: 4 }}>
                <Typography variant={"h5"} component={"h3"}>
                    Who to follow
                </Typography>
                <PersonAddAltOutlinedIcon fontSize={"large"} color="primary" />
            </Stack>
            <Stack gap={2}>
                {userIds.map((userId) => (
                    <UserProvider userId={userId} key={userId}>
                        <SmallUserProfileFollow />
                    </UserProvider>
                ))}
                <Button href="/whoToFollow" >Show more</Button>
            </Stack>
        </Paper>
    )
}