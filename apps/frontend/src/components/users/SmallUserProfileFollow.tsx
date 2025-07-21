import FollowButton from "./FollowButton";
import SmallUserProfile, { SmallUserProfileProps } from './SmallUserProfile';

/** User avatar with name, handle and follow button. */
export default function SmallUserProfileFollow({ children, ...props }: SmallUserProfileProps) {
    return (
        <SmallUserProfile  {...props}>
            <FollowButton sx={{ marginLeft: "auto", flexShrink: 0 }} />
            {children}
        </SmallUserProfile>
    )
}