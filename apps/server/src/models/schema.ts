/**
 * DDL constants mirroring migrations/001_init.sql.
 * Used by the migrate script and (optionally) integration tests.
 *
 * roi_status is computed at query time – it is never stored as a column:
 *   1 = Valid   (period elapsed, non-zero ROI)
 *   2 = Pending (period not yet elapsed at collection snapshot)
 *   3 = Zero    (period elapsed but ROI is 0)
 */

export const ROI_PERIODS = [
  '0d', '1d', '3d', '7d', '14d', '30d', '60d', '90d',
] as const;

export type RoiPeriod = (typeof ROI_PERIODS)[number];

/** Days corresponding to each ROI period label (used in roi_status SQL). */
export const ROI_PERIOD_DAYS: Record<RoiPeriod, number> = {
  '0d':  0,
  '1d':  1,
  '3d':  3,
  '7d':  7,
  '14d': 14,
  '30d': 30,
  '60d': 60,
  '90d': 90,
};

/**
 * Returns the SQL CASE expression that computes roi_status for a given period.
 * The column name follows the pattern roi_Nd (e.g. roi_7d).
 */
export function roiStatusExpr(period: RoiPeriod): string {
  const days = ROI_PERIOD_DAYS[period];
  const col = `roi_${period}`;
  return /* sql */ `
    CASE
      WHEN stat_date + INTERVAL '${days} days'
           > (SELECT collection_date FROM import_metadata LIMIT 1)
      THEN 2
      WHEN ${col} = 0 OR ${col} IS NULL
      THEN 3
      ELSE 1
    END`.trim();
}

export const CREATE_TABLES_SQL = /* sql */ `
CREATE TABLE IF NOT EXISTS import_metadata (
    id              SERIAL       PRIMARY KEY,
    collection_date DATE         NOT NULL,
    imported_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    rows_imported   INTEGER
);

CREATE TABLE IF NOT EXISTS roi_metrics (
    id       SERIAL       PRIMARY KEY,
    stat_date DATE        NOT NULL,
    app_id   VARCHAR(50)  NOT NULL,
    country  VARCHAR(10)  NOT NULL,
    bid_type VARCHAR(20)  NOT NULL,
    installs INTEGER      NOT NULL DEFAULT 0,
    roi_0d   DECIMAL(10, 4),
    roi_1d   DECIMAL(10, 4),
    roi_3d   DECIMAL(10, 4),
    roi_7d   DECIMAL(10, 4),
    roi_14d  DECIMAL(10, 4),
    roi_30d  DECIMAL(10, 4),
    roi_60d  DECIMAL(10, 4),
    roi_90d  DECIMAL(10, 4),
    UNIQUE (stat_date, app_id, country)
);

CREATE INDEX IF NOT EXISTS idx_roi_filter
    ON roi_metrics (app_id, country, stat_date);
`;
