import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { followedOfUser, followersOfUser } from "../api/users/feeds";
import Footer from "../components/layout/mainLayout/footer/Footer";
import TrendsPreview from "../components/layout/mainLayout/footer/modules/Trends";
import LayoutBox from "../components/layout/mainLayout/LayoutBox";
import { MainLayoutInner } from "../components/layout/mainLayout/MainLayout";
import UserFeed from "../components/users/UserFeed";

const FollowsOfUserParamsSchema = z.object({
    userHandle: z.string()
})

export default function FollowsOfUser({ type }: { type: "followers" | "followed" }) {
    const { userHandle } = FollowsOfUserParamsSchema.parse(useParams())
    return (
        <MainLayoutInner
            middle={type === "followers" ? (
                <FollowersOfUser userHandle={userHandle} />
            ) : (
                <FollowedByUser userHandle={userHandle} />
            )}
            right={<Footer ><TrendsPreview /></Footer>}
        />
    )
}

function FollowersOfUser({ userHandle }: { userHandle: string }) {
    return (
        <LayoutBox>
            <Stack gap={2}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h5" component="h1" >
                        Followers of @{userHandle}
                    </Typography>
                </Paper>
                <UserFeed
                    queryKey={["users", "followers", userHandle]}
                    queryFn={async (offset?: number) => await followersOfUser({ offset, userHandle })}
                />
            </Stack>
        </LayoutBox>
    )
}

function FollowedByUser({ userHandle }: { userHandle: string }) {
    return (
        <LayoutBox>
            <Stack gap={2}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h5" component="h1" >
                        Followed by @{userHandle}
                    </Typography>
                </Paper>
                <UserFeed
                    queryKey={["users", "followed", userHandle]}
                    queryFn={async (offset?: number) => await followedOfUser({ offset, userHandle })}
                />
            </Stack>
        </LayoutBox>
    )
}