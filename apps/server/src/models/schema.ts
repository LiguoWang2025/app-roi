/**
 * DDL constants mirroring migrations.
 * Used by the migrate script and (optionally) integration tests.
 *
 * ROI status values (stored per period):
 *   1 = Valid      (period elapsed, non-zero ROI)
 *   2 = Insufficient Date (period not elapsed at collection snapshot)
 *   3 = Real Zero  (period elapsed but ROI is 0)
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
    roi_0d_status  SMALLINT   NOT NULL DEFAULT 1 CHECK (roi_0d_status  IN (1, 2, 3)),
    roi_1d_status  SMALLINT   NOT NULL DEFAULT 1 CHECK (roi_1d_status  IN (1, 2, 3)),
    roi_3d_status  SMALLINT   NOT NULL DEFAULT 1 CHECK (roi_3d_status  IN (1, 2, 3)),
    roi_7d_status  SMALLINT   NOT NULL DEFAULT 1 CHECK (roi_7d_status  IN (1, 2, 3)),
    roi_14d_status SMALLINT   NOT NULL DEFAULT 1 CHECK (roi_14d_status IN (1, 2, 3)),
    roi_30d_status SMALLINT   NOT NULL DEFAULT 1 CHECK (roi_30d_status IN (1, 2, 3)),
    roi_60d_status SMALLINT   NOT NULL DEFAULT 1 CHECK (roi_60d_status IN (1, 2, 3)),
    roi_90d_status SMALLINT   NOT NULL DEFAULT 1 CHECK (roi_90d_status IN (1, 2, 3)),
    UNIQUE (stat_date, app_id, country)
);

CREATE INDEX IF NOT EXISTS idx_roi_filter
    ON roi_metrics (app_id, country, stat_date);
`;
