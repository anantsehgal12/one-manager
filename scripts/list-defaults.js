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

    const rows = await sql`SELECT n.nspname AS schema, c.relname AS table, a.attname AS column, format_type(a.atttypid, a.atttypmod) AS column_type, pg_get_expr(d.adbin, d.adrelid) AS default_expr FROM pg_attrdef d JOIN pg_class c ON d.adrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.adnum ORDER BY n.nspname, c.relname, a.attname;`;

    console.log('All columns with defaults:');
    rows.forEach(r => {
      console.log(`${r.schema}.${r.table}.${r.column} (${r.column_type})  =>  ${r.default_expr}`);
    });

    await sql.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
