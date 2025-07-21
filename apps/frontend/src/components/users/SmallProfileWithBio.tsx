import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { requireUser, useMainStore } from "../globalStore/mainStore";
import { SmallUserProfileProps } from "./SmallUserProfile";
import SmallUserProfileFollow from "./SmallUserProfileFollow";
import { useUser } from "./UserContext";

type SmallProfileWithBioProps = Omit<SmallUserProfileProps, "children">

export default function SmallProfileWithBio({ ...props }: SmallProfileWithBioProps) {
    const { userId } = useUser()
    const bio = useMainStore(requireUser(userId, user => user.bio))
    return (
        <Paper sx={{ p: 2 }}>
            <Stack gap={1}>
                <SmallUserProfileFollow  {...props} />
                {bio !== null &&
                    <Typography variant="body2">
                        {bio}
                    </Typography>
                }
            </Stack>
        </Paper>
    )
}