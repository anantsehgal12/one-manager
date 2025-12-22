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

    const rows = await sql`SELECT a.attname AS column, pg_get_expr(d.adbin, d.adrelid) AS default_expr, pg_typeof(pg_get_expr(d.adbin, d.adrelid)) AS expr_type FROM pg_attrdef d JOIN pg_class c ON d.adrelid = c.oid JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.adnum WHERE c.relname = 'products';`;

    console.log('Defaults for products table:');
    console.dir(rows, { depth: null });

    await sql.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
