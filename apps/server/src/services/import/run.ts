import 'dotenv/config';
import path from 'node:path';
import { importCsv } from './csvImporter';
import { pool } from '../../models/db';

const DEFAULT_CSV = path.resolve(__dirname, '../../../../data/app_roi_data.csv');

async function main() {
  const csvPath = process.argv[2] ?? DEFAULT_CSV;
  const collectionDate = process.argv[3]; // optional override

  console.log(`[import] source: ${csvPath}`);
  const result = await importCsv(csvPath, collectionDate);

  console.log(`[import] done — ${result.imported} rows imported`);
  console.log(`[import] collection_date = ${result.collectionDate}`);

  if (result.errors.length > 0) {
    console.warn(`[import] ${result.errors.length} row-level error(s):`);
    for (const e of result.errors.slice(0, 20)) {
      console.warn(`  • ${e}`);
    }
    if (result.errors.length > 20) {
      console.warn(`  … and ${result.errors.length - 20} more`);
    }
  }
}

main()
  .catch((err) => {
    console.error('[import] failed:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
