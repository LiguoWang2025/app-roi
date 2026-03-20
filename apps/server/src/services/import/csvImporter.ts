import fs from "node:fs";
import { parse } from "fast-csv";
import { PoolClient } from "pg";
import { pool } from "../../models/db";
import { csvRowSchema, CsvRow, mapCountry } from "../../schemas/csvRowSchema";

const BATCH_SIZE = 200;

/**
 * Inferred from CSV tail data pattern:
 * Jul 12 has roi_1d values but roi_3d = 0%, meaning Jul 13 had passed
 * but Jul 14+ had not at time of collection.
 */
const DEFAULT_COLLECTION_DATE = "2025-07-13";

const ROI_COLUMNS = [
  "roi_0d",
  "roi_1d",
  "roi_3d",
  "roi_7d",
  "roi_14d",
  "roi_30d",
  "roi_60d",
  "roi_90d",
] as const;

const ROI_STATUS_COLUMNS = [
  "roi_0d_status",
  "roi_1d_status",
  "roi_3d_status",
  "roi_7d_status",
  "roi_14d_status",
  "roi_30d_status",
  "roi_60d_status",
  "roi_90d_status",
] as const;

const ROI_PERIOD_DAYS_BY_COLUMN: Record<(typeof ROI_COLUMNS)[number], number> = {
  roi_0d: 0,
  roi_1d: 1,
  roi_3d: 3,
  roi_7d: 7,
  roi_14d: 14,
  roi_30d: 30,
  roi_60d: 60,
  roi_90d: 90,
};

const CSV_HEADER_MAP: Record<string, string> = {
  日期: "raw_date",
  app: "app_id",
  出价类型: "bid_type",
  国家地区: "raw_country",
  "应用安装.总次数": "installs",
  当日ROI: "roi_0d",
  "1日ROI": "roi_1d",
  "3日ROI": "roi_3d",
  "7日ROI": "roi_7d",
  "14日ROI": "roi_14d",
  "30日ROI": "roi_30d",
  "60日ROI": "roi_60d",
  "90日ROI": "roi_90d",
};

function parseDate(raw: string): string {
  const m = raw.match(/(\d{4}-\d{2}-\d{2})/);
  if (!m) throw new Error(`Cannot parse date: "${raw}"`);
  return m[1];
}

/**
 * "6.79%"   → 0.0679
 * "1,280.47%" → 12.8047
 * "0%"      → 0
 */
function parseRoiPercent(raw: string): number {
  if (!raw || raw.trim() === "") return 0;
  const cleaned = raw.replace(/,/g, "").replace(/%/g, "").trim();
  const num = Number(cleaned);
  if (Number.isNaN(num)) throw new Error(`Cannot parse ROI value: "${raw}"`);
  return +(num / 100).toFixed(6);
}

function parseInstalls(raw: string): number {
  const cleaned = raw.replace(/,/g, "").trim();
  const num = Number(cleaned);
  if (Number.isNaN(num) || num < 0)
    throw new Error(`Invalid installs: "${raw}"`);
  return Math.round(num);
}

interface RawCsvRecord {
  [key: string]: string;
}

type RoiStatus = 1 | 2 | 3;

function transformRow(raw: RawCsvRecord): CsvRow {
  const mapped: Record<string, string> = {};
  for (const [header, value] of Object.entries(raw)) {
    const key = CSV_HEADER_MAP[header.trim()];
    if (key) mapped[key] = value;
  }

  return csvRowSchema.parse({
    stat_date: parseDate(mapped.raw_date),
    app_id: mapped.app_id?.trim(),
    bid_type: mapped.bid_type?.trim(),
    country: mapCountry(mapped.raw_country?.trim()),
    installs: parseInstalls(mapped.installs),
    roi_0d: parseRoiPercent(mapped.roi_0d),
    roi_1d: parseRoiPercent(mapped.roi_1d),
    roi_3d: parseRoiPercent(mapped.roi_3d),
    roi_7d: parseRoiPercent(mapped.roi_7d),
    roi_14d: parseRoiPercent(mapped.roi_14d),
    roi_30d: parseRoiPercent(mapped.roi_30d),
    roi_60d: parseRoiPercent(mapped.roi_60d),
    roi_90d: parseRoiPercent(mapped.roi_90d),
  });
}

function parseDateToUtc(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

function computeRoiStatus(
  statDate: string,
  collectionDate: string,
  periodDays: number,
  roiValue: number,
): RoiStatus {
  const stat = parseDateToUtc(statDate);
  const cutoff = parseDateToUtc(collectionDate);

  stat.setUTCDate(stat.getUTCDate() + periodDays);
  if (stat > cutoff) return 2;
  if (roiValue === 0) return 3;
  return 1;
}

function readCsv(
  filePath: string,
): Promise<{ rows: CsvRow[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const rows: CsvRow[] = [];
    const errors: string[] = [];
    let lineNum = 1;

    fs.createReadStream(filePath, { encoding: "utf-8" })
      .pipe(parse({ headers: true, trim: true }))
      .on("data", (raw: RawCsvRecord) => {
        lineNum++;
        try {
          rows.push(transformRow(raw));
        } catch (err: any) {
          errors.push(`Line ${lineNum}: ${err.message ?? err}`);
        }
      })
      .on("error", reject)
      .on("end", () => resolve({ rows, errors }));
  });
}

async function insertBatch(
  client: PoolClient,
  batch: CsvRow[],
  collectionDate: string,
): Promise<void> {
  if (batch.length === 0) return;

  const cols = [
    "stat_date",
    "app_id",
    "country",
    "bid_type",
    "installs",
    ...ROI_COLUMNS,
    ...ROI_STATUS_COLUMNS,
  ];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const row of batch) {
    const roiStatuses: Record<(typeof ROI_STATUS_COLUMNS)[number], RoiStatus> = {
      roi_0d_status: computeRoiStatus(
        row.stat_date,
        collectionDate,
        ROI_PERIOD_DAYS_BY_COLUMN.roi_0d,
        row.roi_0d,
      ),
      roi_1d_status: computeRoiStatus(
        row.stat_date,
        collectionDate,
        ROI_PERIOD_DAYS_BY_COLUMN.roi_1d,
        row.roi_1d,
      ),
      roi_3d_status: computeRoiStatus(
        row.stat_date,
        collectionDate,
        ROI_PERIOD_DAYS_BY_COLUMN.roi_3d,
        row.roi_3d,
      ),
      roi_7d_status: computeRoiStatus(
        row.stat_date,
        collectionDate,
        ROI_PERIOD_DAYS_BY_COLUMN.roi_7d,
        row.roi_7d,
      ),
      roi_14d_status: computeRoiStatus(
        row.stat_date,
        collectionDate,
        ROI_PERIOD_DAYS_BY_COLUMN.roi_14d,
        row.roi_14d,
      ),
      roi_30d_status: computeRoiStatus(
        row.stat_date,
        collectionDate,
        ROI_PERIOD_DAYS_BY_COLUMN.roi_30d,
        row.roi_30d,
      ),
      roi_60d_status: computeRoiStatus(
        row.stat_date,
        collectionDate,
        ROI_PERIOD_DAYS_BY_COLUMN.roi_60d,
        row.roi_60d,
      ),
      roi_90d_status: computeRoiStatus(
        row.stat_date,
        collectionDate,
        ROI_PERIOD_DAYS_BY_COLUMN.roi_90d,
        row.roi_90d,
      ),
    };
    const rowPlaceholders: string[] = [];
    for (const col of cols) {
      rowPlaceholders.push(`$${idx++}`);
      if (col in roiStatuses) {
        values.push(roiStatuses[col as keyof typeof roiStatuses]);
      } else {
        values.push(row[col as keyof CsvRow]);
      }
    }
    placeholders.push(`(${rowPlaceholders.join(", ")})`);
  }

  const updateSet = cols
    .filter((c) => c !== "stat_date" && c !== "app_id" && c !== "country")
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(", ");

  const sql = `
    INSERT INTO roi_metrics (${cols.join(", ")})
    VALUES ${placeholders.join(",\n       ")}
    ON CONFLICT (stat_date, app_id, country)
    DO UPDATE SET ${updateSet}
  `;

  await client.query(sql, values);
}

async function acquireImportLock(client: PoolClient): Promise<void> {
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('csv_import_lock'))",
  );
}

export interface ImportResult {
  imported: number;
  collectionDate: string;
  errors: string[];
}

export async function importCsv(
  filePath: string,
  collectionDate?: string,
): Promise<ImportResult> {
  const effectiveDate = collectionDate ?? DEFAULT_COLLECTION_DATE;

  console.log(`[import] parsing ${filePath} …`);
  const { rows, errors } = await readCsv(filePath);
  console.log(`[import] parsed ${rows.length} rows, ${errors.length} error(s)`);

  if (rows.length === 0) {
    return { imported: 0, collectionDate: effectiveDate, errors };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await acquireImportLock(client);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await insertBatch(client, batch, effectiveDate);
      if ((i / BATCH_SIZE) % 5 === 0) {
        console.log(
          `[import] inserted ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`,
        );
      }
    }

    await client.query(
      `INSERT INTO import_metadata (collection_date, rows_imported)
       VALUES ($1, $2)`,
      [effectiveDate, rows.length],
    );

    await client.query("COMMIT");
    console.log(
      `[import] committed ${rows.length} rows, collection_date=${effectiveDate}`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return { imported: rows.length, collectionDate: effectiveDate, errors };
}
