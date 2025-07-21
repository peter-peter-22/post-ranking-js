import { useTheme } from "@mui/material/styles";
import { memo } from "react";
import { getStandardGradient } from '../../utilities/getStandardGradient';
import GradientFab, { GradientFabProps } from '../buttons/GradientFab';
import { useFollowUser } from "./useFollowUser";
import { useUser } from "./UserContext";

const FollowButton = memo(({
    size = "small",
    ...props
}: Omit<GradientFabProps, "gradient" | "variant">) => {
    const theme = useTheme()
    const gradient = getStandardGradient(theme)
    const { userId } = useUser()
    const { toggleFollow,followed } = useFollowUser(userId)
    return (
        <GradientFab
            variant="extended"
            gradient={gradient}
            size={size}
            onClick={toggleFollow}
            {...props}
        >
            {followed ? "Unfollow" : "Follow"}
        </GradientFab>
    )
})
export default FollowButton