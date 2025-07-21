import * as Minio from 'minio'
import { env } from '../zod/env';

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_HOST,
  port: env.MINIO_PORT,
  useSSL: false, // Set to true for HTTPS
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY
});