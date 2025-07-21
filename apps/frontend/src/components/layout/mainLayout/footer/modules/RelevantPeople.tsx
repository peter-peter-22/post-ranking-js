import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SmallUserProfileFollow from "../../../../users/SmallUserProfileFollow";
import { UserProvider } from '../../../../users/UserContext';

/** Display a list of users relevant to the post. */
export default function RelevantPeople({ userIds }: { userIds: string[] }) {
    return (
        <Paper component="aside" sx={{ p: 2 }}>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} gap={1} sx={{ mb: 4 }}>
                <Typography variant={"h5"} component={"h3"}>
                    Relevant people
                </Typography>
                <PeopleAltOutlinedIcon fontSize={"large"} color="primary" />
            </Stack>
            <Stack gap={1}>
                {userIds.map((userId) => (
                    <UserProvider userId={userId} key={userId}>
                        <SmallUserProfileFollow />
                    </UserProvider>
                ))}
            </Stack>
        </Paper>
    )
}