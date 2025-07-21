import { AuthResponseSchema, CommonDataResponse, LoginFormData } from "@me/schemas/src/zod/createUser";
import { processUsers } from "../../components/globalStore/mainStore";
import { apiClient } from "../api";

function processCommon(data: CommonDataResponse) {
    return {
        whoToFollow: processUsers(data.whoToFollow),
        trends:data.trends
    }
}

export type CommonData = ReturnType<typeof processCommon>

export async function authenticate(userHandle: string) {
    const res = await apiClient.post("/authenticate", { userHandle } as LoginFormData);
    const { user, common } = AuthResponseSchema.parse(res.data)
    processUsers([user])
    return { user, common: processCommon(common) }
}

