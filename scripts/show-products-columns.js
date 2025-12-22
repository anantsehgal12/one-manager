#!/usr/bin/env node
const postgres = require('postgres');
(async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) { console.error('DATABASE_URL not set'); process.exit(2); }
    const sql = postgres(databaseUrl, { ssl: false });
    const cols = await sql`SELECT column_name, data_type, udt_name, column_default FROM information_schema.columns WHERE table_name='products' ORDER BY column_name`;
    console.log('Products columns:');
    console.dir(cols, { depth: null });
    await sql.end();
  } catch (err) { console.error(err); process.exit(1); }
})();
