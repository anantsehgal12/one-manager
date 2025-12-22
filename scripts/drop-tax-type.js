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

    console.log('Dropping type public.tax_percentage if it exists...');
    await sql`DROP TYPE IF EXISTS public.tax_percentage`;

    console.log('Done.');
    await sql.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
