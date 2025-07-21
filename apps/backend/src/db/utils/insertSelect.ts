import { getTableName, Table } from "drizzle-orm"
import { getTableConfig, PgColumn } from "drizzle-orm/pg-core"
import { db } from ".."

/**
 * Inserts the results from a subquery into a table.
 * @param into The target table to insert into.
 * @param select The select subquery. 
 * @param columns An optional list of columns to include in the insert statement. If not specified, all non-generated columns are used.
 */
export async function insertSelect<T>(
    into: Table,
    select: {
        execute: () => Promise<T[]>,
        toSQL: () => { sql: string, params: any[] }
    },
    columns: PgColumn[] | undefined = undefined
) {
    // If no columns are specified, use all non-generated columns
    if (!columns)
        columns = getTableConfig(into).columns.filter(c => !c.generated)
    // Get and format the column names 
    const columnNames = columns.map((col) => '"' + col.name + '"').join(', ')
    // Get the raw sql and the params of the subquery
    const query = select.toSQL()
    // Build the insert query
    const text = `insert into ${getTableName(into)} (${columnNames}) ${query.sql}`
    // Execute the query on the client
    await db.$client.query(text, query.params)
}