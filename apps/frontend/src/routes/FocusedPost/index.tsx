import { useLoaderData } from "react-router-dom";
import { z } from "zod";
import { getSinglePost } from "../../api/posts/getCached";
import { PostOnly } from "../../components/globalStore/mainStore";
import Footer from "../../components/layout/mainLayout/footer/Footer";
import RelevantPeople from "../../components/layout/mainLayout/footer/modules/RelevantPeople";
import { MainLayoutInner } from "../../components/layout/mainLayout/MainLayout";
import FocusedPostPage from "./FocusedPostPage";
import WhoToFollow from "../../components/layout/mainLayout/footer/modules/WhoToFollow";

const postLoaderSchema = z.object({
    user: z.string(),
    post: z.string()
})

export async function postLoader({ params }: { params: object }) {
    const parsedParams = postLoaderSchema.parse(params)
    return await getSinglePost(parsedParams.post)
}

export default function FocusedPost() {
    const post = useLoaderData<PostOnly>();
    return (
        <MainLayoutInner
            middle={<FocusedPostPage postId={post.id} repliedId={post.replyingTo}/>}
            right={<Footer >
                <RelevantPeople userIds={[post.userId]} />
                <WhoToFollow />
            </Footer>}
        />
    )
}