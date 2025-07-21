import axios from "axios";
import { env } from "../zod/env";

/** Axios instance to communicate with the image transformer API */
export const mediaTransformerApi = axios.create({
    baseURL: env.MEDIA_TRANSFORMER_URL,
    headers:{
        "secret-key":env.MEDIA_TRANSFORMER_SECRET_KEY
    }
})