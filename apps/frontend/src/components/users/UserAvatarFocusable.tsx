import { FullscreenMediaProvider, useFullscreenMedia } from "../media/FullscreenMedia"
import UserAvatar, { UserAvatarProps } from "./UserAvatar"

export default function UserAvatarFocusable(props: UserAvatarProps) {
    return props.file ? (
        <FullscreenMediaProvider files={[props.file]}>
            <Inner  {...props} />
        </FullscreenMediaProvider>
    ) : (
        <UserAvatar {...props} />
    )
}

function Inner({ sx, ...props }: UserAvatarProps) {
    const { show } = useFullscreenMedia()
    return (
        <UserAvatar
            {...props}
            sx={{
                ...sx,
                cursor: "pointer"
            }}
            onClick={() => { show() }}
        />
    )
}