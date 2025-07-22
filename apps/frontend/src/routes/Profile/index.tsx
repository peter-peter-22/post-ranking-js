import { useLoaderData } from "react-router-dom";
import { z } from "zod";
import { getCachedUser } from "../../api/users/cache";
import { MainLayoutInner } from "../../components/layout/mainLayout/MainLayout";
import Footer from "../../components/layout/mainLayout/footer/Footer";
import { UserProvider } from "../../components/users/UserContext";
import { User } from "@me/schemas/src/zod/user";
import FocusedUserProfile from "./FocusedUserProfile";
import WhoToFollow from "../../components/layout/mainLayout/footer/modules/WhoToFollow";

const userLoaderSchema = z.object({
    id: z.string()
})

export async function userLoader({ params }: { params: object }) {
    const parsedParams = userLoaderSchema.parse(params)
    return await getCachedUser(parsedParams.id)
}

export default function Profile() {
    const user = useLoaderData<User>();
    return (
        <UserProvider userId={user.id}>
            <MainLayoutInner
                middle={<FocusedUserProfile />}
                right={
                    <Footer >
                        <WhoToFollow />
                    </Footer>
                }
            />
        </UserProvider>
    )
}