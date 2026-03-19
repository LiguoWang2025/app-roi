import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../models/db';

const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(/* sql */ `
      CREATE TABLE IF NOT EXISTS _migrations (
        id          SERIAL PRIMARY KEY,
        filename    VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows: executed } = await client.query<{ filename: string }>(
      'SELECT filename FROM _migrations ORDER BY id',
    );
    const executedSet = new Set(executed.map((r) => r.filename));

    let applied = 0;
    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`[migrate] skip  ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      console.log(`[migrate] apply ${file} …`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        applied++;
        console.log(`[migrate] done  ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    if (applied === 0) {
      console.log('[migrate] nothing to apply – database is up to date');
    } else {
      console.log(`[migrate] ${applied} migration(s) applied`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
