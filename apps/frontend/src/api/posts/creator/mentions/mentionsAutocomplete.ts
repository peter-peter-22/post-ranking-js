import { z } from "zod";
import { apiClient } from "../../../api";

const UserPredictionSchema = z.object({
    handle: z.string(),
    name: z.string(),
})

const MentionPredictionResponseSchema = z.object({
    users: UserPredictionSchema.array()
})

export type UserPrediction = z.infer<typeof UserPredictionSchema>

export async function getMentionAutocomplete(text: string) {
    const res = await apiClient.post("/userActions/postCreatorTextPrediction/mention", { text })
    const { users } = MentionPredictionResponseSchema.parse(res.data)
    return users
}