import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../zod/env';

const pool = new pg.Pool({
    connectionString: env.DB_URL,
});

export const db = drizzle({ client: pool });