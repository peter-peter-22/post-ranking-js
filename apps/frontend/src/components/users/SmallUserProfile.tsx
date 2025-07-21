import Stack, { StackProps } from "@mui/material/Stack";
import { useShallow } from 'zustand/react/shallow';
import { requireUser, useMainStore } from "../globalStore/mainStore";
import LinkedAvatar from './LinkedAvatar';
import { useUser } from "./UserContext";
import UserFloatingMenu from "./UserFloatingMenu";
import UserHandle from "./UserHandle";
import UserNameLink from "./UserNameLink";

export type SmallUserProfileProps = StackProps

/** User avatar with name and handle. */
export default function SmallUserProfile({ children, ...props }: SmallUserProfileProps) {
    const { userId } = useUser()
    const { name, handle } = useMainStore(useShallow(
        requireUser(userId, user => ({
            handle: user.handle,
            name: user.name
        }))
    ))
    return (
        <Stack direction={"row"} gap={1} alignItems={"start"} {...props}>
            <UserFloatingMenu>
                <LinkedAvatar />
            </UserFloatingMenu>
            <Stack sx={{ overflow: "hidden" }}>
                <UserFloatingMenu>
                    <UserNameLink name={name} handle={handle} />
                </UserFloatingMenu>
                    <UserHandle handle={handle} />
            </Stack>
            {children}
        </Stack>
    )
}