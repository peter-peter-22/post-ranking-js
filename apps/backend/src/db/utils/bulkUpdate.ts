import { SQL, sql } from 'drizzle-orm';
import { PgTableWithColumns } from 'drizzle-orm/pg-core';

/**
 * Create a batch UPDATE ... FROM (VALUES ...) query in Drizzle.
 */
export function bulkUpdateFromValues<
  TTable extends PgTableWithColumns<any>,
  TRow extends Record<string, any>,
  TKey extends keyof TRow
>({
  table,
  rows,
  key,
  updateCols,
}: {
  table: TTable;
  rows: TRow[];
  key: TKey;
  updateCols: (keyof TRow)[];
}): SQL | null {
  if (rows.length === 0) return null;

  const alias = sql.identifier('v');
  const columns = [key, ...updateCols];

  const valuesSQL = sql.join(
    rows.map((row) =>
      sql`(${sql.join(columns.map((col) => sql`${row[col]}`), sql`,`)})`
    ),
    sql`, `
  );

  const aliasedCols = columns.map((col) => sql.identifier(String(col)));

  const updates = updateCols.map(
    (col) =>
      sql`${table[col]} = ${alias}.${sql.identifier(String(col))}`
  );

  return sql`
    UPDATE ${table} AS t
    SET ${sql.join(updates, sql`, `)}
    FROM (VALUES ${valuesSQL}) AS ${alias} (${sql.join(aliasedCols, sql`, `)})
    WHERE t.${table[key]} = ${alias}.${sql.identifier(String(key))};
  `;
}
