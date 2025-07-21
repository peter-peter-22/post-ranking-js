import Link from '@mui/material/Link';
import { useUser } from './UserContext';
import { requireUser, useMainStore } from '../globalStore/mainStore';
import { useShallow } from 'zustand/react/shallow';

export function FollowerCounter() {
    const { userId } = useUser()
    const user = useMainStore(useShallow(requireUser(userId, user => ({
        followerCount: user.followerCount,
        handle: user.handle
    }))))
    return (
        <Link
            href={`/users/${user.handle}/followers`}
            color="textPrimary"
            underline='hover'
            variant="body2"
        >
            <span style={{ fontWeight: "bold" }}>{user.followerCount}</span> Followers
        </Link>
    )
}

export function FollowingCounter() {
    const { userId } = useUser()
    const user = useMainStore(useShallow(requireUser(userId, user => ({
        followingCount: user.followingCount,
        handle: user.handle
    }))))
    return (
        <Link
            href={`/users/${user.handle}/followed`}
            color="textPrimary"
            underline='hover'
            variant="body2"
        >
            <span style={{ fontWeight: "bold" }}>{user.followingCount}</span> Following
        </Link>
    )
}