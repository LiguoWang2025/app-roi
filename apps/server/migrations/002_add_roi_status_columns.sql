-- Migration: 002_add_roi_status_columns
-- Adds per-period ROI status columns to distinguish:
--   1 = Valid (elapsed + non-zero)
--   2 = Insufficient Date (not elapsed at collection snapshot)
--   3 = Real Zero (elapsed + zero)

ALTER TABLE roi_metrics
  ADD COLUMN IF NOT EXISTS roi_0d_status  SMALLINT NOT NULL DEFAULT 1 CHECK (roi_0d_status  IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS roi_1d_status  SMALLINT NOT NULL DEFAULT 1 CHECK (roi_1d_status  IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS roi_3d_status  SMALLINT NOT NULL DEFAULT 1 CHECK (roi_3d_status  IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS roi_7d_status  SMALLINT NOT NULL DEFAULT 1 CHECK (roi_7d_status  IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS roi_14d_status SMALLINT NOT NULL DEFAULT 1 CHECK (roi_14d_status IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS roi_30d_status SMALLINT NOT NULL DEFAULT 1 CHECK (roi_30d_status IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS roi_60d_status SMALLINT NOT NULL DEFAULT 1 CHECK (roi_60d_status IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS roi_90d_status SMALLINT NOT NULL DEFAULT 1 CHECK (roi_90d_status IN (1, 2, 3));

DO $$
DECLARE
  v_collection_date DATE;
BEGIN
  SELECT collection_date
    INTO v_collection_date
  FROM import_metadata
  ORDER BY id DESC
  LIMIT 1;

  IF v_collection_date IS NULL THEN
    RETURN;
  END IF;

  UPDATE roi_metrics
  SET
    roi_0d_status = CASE
      WHEN stat_date + INTERVAL '0 days' > v_collection_date THEN 2
      WHEN roi_0d = 0 OR roi_0d IS NULL THEN 3
      ELSE 1
    END,
    roi_1d_status = CASE
      WHEN stat_date + INTERVAL '1 days' > v_collection_date THEN 2
      WHEN roi_1d = 0 OR roi_1d IS NULL THEN 3
      ELSE 1
    END,
    roi_3d_status = CASE
      WHEN stat_date + INTERVAL '3 days' > v_collection_date THEN 2
      WHEN roi_3d = 0 OR roi_3d IS NULL THEN 3
      ELSE 1
    END,
    roi_7d_status = CASE
      WHEN stat_date + INTERVAL '7 days' > v_collection_date THEN 2
      WHEN roi_7d = 0 OR roi_7d IS NULL THEN 3
      ELSE 1
    END,
    roi_14d_status = CASE
      WHEN stat_date + INTERVAL '14 days' > v_collection_date THEN 2
      WHEN roi_14d = 0 OR roi_14d IS NULL THEN 3
      ELSE 1
    END,
    roi_30d_status = CASE
      WHEN stat_date + INTERVAL '30 days' > v_collection_date THEN 2
      WHEN roi_30d = 0 OR roi_30d IS NULL THEN 3
      ELSE 1
    END,
    roi_60d_status = CASE
      WHEN stat_date + INTERVAL '60 days' > v_collection_date THEN 2
      WHEN roi_60d = 0 OR roi_60d IS NULL THEN 3
      ELSE 1
    END,
    roi_90d_status = CASE
      WHEN stat_date + INTERVAL '90 days' > v_collection_date THEN 2
      WHEN roi_90d = 0 OR roi_90d IS NULL THEN 3
      ELSE 1
    END;
END $$;
