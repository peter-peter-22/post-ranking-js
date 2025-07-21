import { z } from "zod";
import { TrendSchema } from "../../../../types/trend";
import { apiClient } from "../../../api";

const HashtagPredictionResponse = z.object({
    hashtags: TrendSchema.array()
})

export async function getHashtagAutocomplete(text: string) {
    const res = await apiClient.post("userActions/postCreatorTextPrediction/hashtag", { text })
    const { hashtags } = HashtagPredictionResponse.parse(res.data)
    hashtags.forEach(trend => { trend.keyword = trend.keyword.replace(" ", "_") })
    return hashtags
}