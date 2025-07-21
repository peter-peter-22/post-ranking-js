import { useSearchParams } from "react-router-dom";
import { searchLatestPosts } from "../../api/posts/feed";
import PostFeed from "../../components/posts/PostFeed";

export default function SearchLatestPosts() {
    const [searchParams] = useSearchParams();
    return (
        <PostFeed
            queryKey={["posts", "search", "latest", searchParams.toString()]}
            queryFn={async (offset?: number) => await (searchLatestPosts({ offset, text: searchParams.get("text") ?? "" }))}
        />
    )
}