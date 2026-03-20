-- Migration: 001_init
-- Creates the two core tables for the Ad-ROI system.
--
-- roi_*_status columns are stored per period:
--   1 = Valid            (period elapsed, non-zero ROI)
--   2 = Insufficient Date(period not yet elapsed at collection snapshot)
--   3 = Real Zero        (period elapsed and ROI = 0)

-- ---------------------------------------------------------------------------
-- 1. import_metadata: one row per CSV import, stores the snapshot date
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_metadata (
    id              SERIAL PRIMARY KEY,
    collection_date DATE        NOT NULL,
    imported_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
    rows_imported   INTEGER
);

-- ---------------------------------------------------------------------------
-- 2. roi_metrics: one row per (stat_date, app_id, country) combination
--    ROI values are stored as plain decimals (e.g. 1.2047 = 120.47%)
-- ---------------------------------------------------------------------------
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

-- Composite index to accelerate the typical filter + date-range query pattern
CREATE INDEX IF NOT EXISTS idx_roi_filter
    ON roi_metrics (app_id, country, stat_date);
