import { useSearchParams } from "react-router-dom";
import { searchTopPosts } from "../../api/posts/feed";
import PostFeed from "../../components/posts/PostFeed";

export default function SearchTopPosts() {
    const [searchParams] = useSearchParams();
    return (
        <PostFeed
            queryKey={["posts", "search", "top", searchParams.toString()]}
            queryFn={async (offset?: number) => await (searchTopPosts({ offset, text: searchParams.get("text") ?? "" }))}
        />
    )
}