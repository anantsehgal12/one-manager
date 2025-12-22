#!/usr/bin/env node
const postgres = require('postgres');

(async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL not set; run with `-r dotenv/config` or set env');
      process.exit(2);
    }
    const sql = postgres(databaseUrl, { ssl: false });

    const info = await sql`SELECT n.nspname AS schema, c.relname AS table, a.attname AS column, pg_get_expr(d.adbin, d.adrelid) AS default_expr, pg_typeof(pg_get_expr(d.adbin, d.adrelid)) AS expr_type, format_type(a.atttypid, a.atttypmod) AS column_type FROM pg_attrdef d JOIN pg_class c ON d.adrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.adnum WHERE pg_get_expr(d.adbin, d.adrelid) ILIKE '%tax_percentage%';`;

    console.log('Matches for default expressions containing "tax_percentage":', info);

    const col = await sql`SELECT table_schema, table_name, column_name, column_default FROM information_schema.columns WHERE column_name='tax_percentage'`;
    console.log('Information schema rows for columns named tax_percentage:', col);

    await sql.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
