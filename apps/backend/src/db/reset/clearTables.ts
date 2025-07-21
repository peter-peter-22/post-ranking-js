import { sql } from "drizzle-orm";
import { db } from "..";
import { PgTableWithColumns } from "drizzle-orm/pg-core";

interface TableInfo {
    table_name: string;
    [key: string]: unknown;
}

/**
 * Clear all tables
 */
export async function clearAllTables() {
    try {
        // Get the list of all tables in the database
        const tables = await db.execute<TableInfo>(
            sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
        );

        // Get the names of the tables
        const tableNames = tables.rows.map((table) => table.table_name);

        // Trunace each table
        await clearTables(tableNames);

        console.log('All tables cleared successfully.');
    } catch (error) {
        console.error('Error clearing tables:', error);
        throw error;
    }
}

/**
 * Clear specific tables
 * @param tables List of table names to clear
 */
export async function clearTables(tables: string[]) {
    for (const table of tables) {
        await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`);
        console.log(`Cleared table: ${table}`);
    }
}