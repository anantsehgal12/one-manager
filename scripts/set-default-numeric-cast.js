#!/usr/bin/env node
const postgres = require('postgres');
(async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) { console.error('DATABASE_URL not set'); process.exit(2); }
    const sql = postgres(databaseUrl, { ssl: false });
    console.log('Setting default to numeric cast 0::numeric for tax_percentage...');
    await sql`ALTER TABLE products ALTER COLUMN tax_percentage SET DEFAULT 0::numeric`;
    const row = await sql`SELECT column_name, column_default FROM information_schema.columns WHERE table_name='products' AND column_name='tax_percentage'`;
    console.log('After:', row);
    await sql.end();
    console.log('Done.');
  } catch (err) { console.error(err); process.exit(1); }
})();
