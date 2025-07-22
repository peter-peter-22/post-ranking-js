import { z } from "zod";
import { apiClient } from "../../../api";
import { TrendSchema } from "@me/schemas/src/zod/trends";

const HashtagPredictionResponse = z.object({
    hashtags: TrendSchema.array()
})

export async function getHashtagAutocomplete(text: string) {
    const res = await apiClient.post("userActions/postCreatorTextPrediction/hashtag", { text })
    const { hashtags } = HashtagPredictionResponse.parse(res.data)
    hashtags.forEach(trend => { trend.keyword = trend.keyword.replace(" ", "_") })
    return hashtags
}