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

    const types = await sql`SELECT n.nspname AS schema, t.typname AS type_name, t.typtype FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'tax_percentage'`;
    console.log('tax_percentage types found:', types);

    await sql.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
