export const CREATE_TABLES_SQL = /* sql */ `
CREATE TABLE IF NOT EXISTS import_metadata (
  id             SERIAL PRIMARY KEY,
  collection_date DATE NOT NULL,
  imported_at    TIMESTAMP DEFAULT NOW(),
  rows_imported  INTEGER
);

CREATE TABLE IF NOT EXISTS roi_metrics (
  id       SERIAL PRIMARY KEY,
  stat_date DATE         NOT NULL,
  app_id   VARCHAR(50)  NOT NULL,
  country  VARCHAR(10)  NOT NULL,
  bid_type VARCHAR(20)  NOT NULL,
  installs INTEGER      NOT NULL DEFAULT 0,
  roi_0d   DECIMAL(10,4),
  roi_1d   DECIMAL(10,4),
  roi_3d   DECIMAL(10,4),
  roi_7d   DECIMAL(10,4),
  roi_14d  DECIMAL(10,4),
  roi_30d  DECIMAL(10,4),
  roi_60d  DECIMAL(10,4),
  roi_90d  DECIMAL(10,4),
  UNIQUE(stat_date, app_id, country)
);

CREATE INDEX IF NOT EXISTS idx_roi_filter
  ON roi_metrics(app_id, country, stat_date);
`;
