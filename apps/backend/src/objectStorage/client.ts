import * as Minio from 'minio'
import { env } from '../zod/env';

export const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false, // Set to true for HTTPS
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY
});