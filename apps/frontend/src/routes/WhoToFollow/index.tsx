import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Footer from "../../components/layout/mainLayout/footer/Footer";
import TrendsPreview from "../../components/layout/mainLayout/footer/modules/Trends";
import LayoutBox from "../../components/layout/mainLayout/LayoutBox";
import { MainLayoutInner } from "../../components/layout/mainLayout/MainLayout";
import UserFeed from "../../components/users/UserFeed";
import { whoToFollowFeed } from "../../api/users/whoToFollow";

export default function WhoToFollowPage() {
    return (
        <MainLayoutInner
            middle={
                <LayoutBox>
                    <Stack gap={2}>
                        <Paper sx={{p:2}}>
                            <Typography variant="h5" component="h1">
                                Users who may interest you
                            </Typography>
                        </Paper>
                        <UserFeed
                            queryKey={["users", "whoToFollow", "expanded"]}
                            queryFn={async (offset?: number) => await whoToFollowFeed(offset)}
                        />
                    </Stack>
                </LayoutBox>
            }
            right={
                <Footer><TrendsPreview /></Footer>
            }
        />
    )
}