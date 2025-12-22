#!/usr/bin/env node
const postgres = require('postgres');

(async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set in the environment');
      process.exit(2);
    }
    const sql = postgres(process.env.DATABASE_URL, { ssl: false });

    console.log('Checking current default for products."tax_percentage"...');
    const before = await sql`SELECT column_default FROM information_schema.columns WHERE table_name='products' AND column_name='tax_percentage'`;
    console.log('Before:', before);

    console.log('Dropping existing default...');
    await sql`ALTER TABLE products ALTER COLUMN tax_percentage DROP DEFAULT`;

    console.log('Setting numeric default 0...');
    await sql`ALTER TABLE products ALTER COLUMN tax_percentage SET DEFAULT 0`;

    const after = await sql`SELECT column_default FROM information_schema.columns WHERE table_name='products' AND column_name='tax_percentage'`;
    console.log('After:', after);

    await sql.end({ timeout: 3 });
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
