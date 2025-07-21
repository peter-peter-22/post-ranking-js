import Cursor from 'pg-cursor';
import { db } from "..";

/** Generator function to stream batch of rows from a drizzle query with a database cursor.
 * @param drizzleQuery - The drizzle query to execute.
 * @param batchSize - The number of rows to fetch in each batch. Default is 10,000.
 * @returns A generator function that yields the results of the query as a stream of rows.
 */
export async function* createStream<T>(
    drizzleQuery: {
        execute: () => Promise<T[]>,
        toSQL: () => { sql: string, params: any[] }
    },
    batchSize: number = 10000
):AsyncGenerator<T> {
    // Create a database connection
    const client = await db.$client.connect()
    try {
        // Get the raw query
        const rawQuery = drizzleQuery.toSQL()
        // Create a cursor for the raw query
        const cursor = client.query(new Cursor(rawQuery.sql, rawQuery.params))
        // Fetch the rows in batches from the cursor, yield each row
        while (true) {
            const rows = await cursor.read(batchSize)
            if (rows.length === 0) break // No more rows to fetch
            for (const row of rows)
                yield row
        }
    }
    finally {
        // Release the database connection
        client.release()
    }
}