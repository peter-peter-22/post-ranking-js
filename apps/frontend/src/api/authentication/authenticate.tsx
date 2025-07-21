import { z } from "zod";
import { processUsers } from "../../components/globalStore/mainStore";
import { UserSchema } from "../../types/user";
import { apiClient } from "../api";
import { TrendSchema } from "../../types/trend";

const CommonDataResponse = z.object({
    whoToFollow: z.array(UserSchema),
    trends: z.array(TrendSchema)
})

const AuthResponseSchema = z.object({
    user: UserSchema,
    common: CommonDataResponse
})

type CommonDataResponseType = z.infer<typeof CommonDataResponse>

function processCommon(data: CommonDataResponseType) {
    return {
        whoToFollow: processUsers(data.whoToFollow),
        trends:data.trends
    }
}

export type CommonData = ReturnType<typeof processCommon>

export async function authenticate(userHandle: string) {
    const res = await apiClient.post("/authenticate", { handle: userHandle });
    const { user, common } = AuthResponseSchema.parse(res.data)
    processUsers([user])
    return { user, common: processCommon(common) }
}

