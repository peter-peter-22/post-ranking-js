import { defineConfig } from 'drizzle-kit';
import {env} from "./src/zod/env"

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema',
    dialect: 'postgresql',
    dbCredentials: {
        url: env.DB_URL
    },
});