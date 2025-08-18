import 'dotenv/config';
import z from "zod";

const envModel = z.object({
    DB_URL: z.string().url(),

    EMBEDDING_API_URL: z.string().url(),
    CLUSTERING_API_URL: z.string().url(),
    RANKER_API_URL: z.string().url(),

    REDIS_URL: z.string(),

    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
    MINIO_PUBLIC_BUCKET: z.string(),
    MINIO_HOST: z.string(),
    MINIO_PORT: z.coerce.number(),

    MEDIA_TRANSFORMER_URL: z.string().url(),
    MEDIA_TRANSFORMER_SECRET_KEY: z.string(),

    HAZELCAST_URL: z.string()
})

export const env = envModel.parse(process.env)