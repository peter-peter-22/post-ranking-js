import { useSearchParams } from "react-router-dom";
import UserFeed from "../../components/users/UserFeed";
import { searchUsers } from "../../api/users/feeds";

export default function UserSearchPage() {
    const [searchParams] = useSearchParams();
    return (
        <UserFeed
            queryKey={["users", "search", searchParams.toString()]}
            queryFn={async (offset?: number) => await searchUsers({ offset, text: searchParams.get("text") || "" })}
        />
    )
}