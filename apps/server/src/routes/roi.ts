import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { roiQuerySchema } from "../schemas/roiQuerySchema";
import { pool } from "../models/db";

const router = Router();
const ROI_REASON_MAP = {
  1: "valid",
  2: "insufficient_date",
  3: "real_zero",
} as const;

router.get("/roi", async (req: Request, res: Response) => {
  try {
    const query = roiQuerySchema.parse(req.query);
    const { app_id, country, start_date, end_date, roi_period, ma_days } =
      query;

    const roiCol = `roi_${roi_period}`;
    const statusCol = `${roiCol}_status`;

    // Entity filters go in the CTE so the window function sees the full
    // date range for each partition → accurate moving averages even at
    // the edges of the requested date range.
    const innerConds: string[] = [];
    const outerConds: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (app_id && app_id.length > 0) {
      innerConds.push(`r.app_id = ANY($${idx++})`);
      params.push(app_id);
    }
    if (country && country.length > 0) {
      innerConds.push(`r.country = ANY($${idx++})`);
      params.push(country);
    }
    if (start_date) {
      outerConds.push(`stat_date >= $${idx++}`);
      params.push(start_date);
    }
    if (end_date) {
      outerConds.push(`stat_date <= $${idx++}`);
      params.push(end_date);
    }

    const innerWhere =
      innerConds.length > 0 ? `WHERE ${innerConds.join(" AND ")}` : "";
    const outerWhere =
      outerConds.length > 0 ? `WHERE ${outerConds.join(" AND ")}` : "";

    const sql = `
      WITH base AS (
        SELECT
          r.stat_date,
          r.app_id,
          r.country,
          r.installs,
          r.roi_0d,
          r.roi_1d,
          r.roi_3d,
          r.roi_7d,
          r.roi_14d,
          r.roi_30d,
          r.roi_60d,
          r.roi_90d,
          r.roi_0d_status,
          r.roi_1d_status,
          r.roi_3d_status,
          r.roi_7d_status,
          r.roi_14d_status,
          r.roi_30d_status,
          r.roi_60d_status,
          r.roi_90d_status,
          r.${roiCol}  AS roi_value,
          r.${statusCol} AS roi_status,
          AVG(r.${roiCol}) OVER (
            PARTITION BY r.app_id, r.country
            ORDER BY r.stat_date
            ROWS BETWEEN ${ma_days - 1} PRECEDING AND CURRENT ROW
          ) AS moving_avg
        FROM roi_metrics r
        ${innerWhere}
      )
      SELECT
        TO_CHAR(stat_date, 'YYYY-MM-DD') AS stat_date,
        app_id,
        country,
        installs,
        roi_0d,
        roi_1d,
        roi_3d,
        roi_7d,
        roi_14d,
        roi_30d,
        roi_60d,
        roi_90d,
        roi_0d_status,
        roi_1d_status,
        roi_3d_status,
        roi_7d_status,
        roi_14d_status,
        roi_30d_status,
        roi_60d_status,
        roi_90d_status,
        roi_value,
        roi_status,
        moving_avg
      FROM base
      ${outerWhere}
      ORDER BY stat_date, app_id, country
    `;

    const [dataResult, metaResult] = await Promise.all([
      pool.query(sql, params),
      pool.query(
        `SELECT TO_CHAR(collection_date, 'YYYY-MM-DD') AS collection_date
         FROM import_metadata ORDER BY id DESC LIMIT 1`,
      ),
    ]);

    const collectionDate: string | null =
      metaResult.rows[0]?.collection_date ?? null;

    res.json({
      data: dataResult.rows.map((r) => ({
        stat_date: r.stat_date,
        app_id: r.app_id,
        country: r.country,
        installs: Number(r.installs),
        roi_0d: r.roi_0d != null ? Number(r.roi_0d) : null,
        roi_1d: r.roi_1d != null ? Number(r.roi_1d) : null,
        roi_3d: r.roi_3d != null ? Number(r.roi_3d) : null,
        roi_7d: r.roi_7d != null ? Number(r.roi_7d) : null,
        roi_14d: r.roi_14d != null ? Number(r.roi_14d) : null,
        roi_30d: r.roi_30d != null ? Number(r.roi_30d) : null,
        roi_60d: r.roi_60d != null ? Number(r.roi_60d) : null,
        roi_90d: r.roi_90d != null ? Number(r.roi_90d) : null,
        roi_0d_status: Number(r.roi_0d_status) as 1 | 2 | 3,
        roi_1d_status: Number(r.roi_1d_status) as 1 | 2 | 3,
        roi_3d_status: Number(r.roi_3d_status) as 1 | 2 | 3,
        roi_7d_status: Number(r.roi_7d_status) as 1 | 2 | 3,
        roi_14d_status: Number(r.roi_14d_status) as 1 | 2 | 3,
        roi_30d_status: Number(r.roi_30d_status) as 1 | 2 | 3,
        roi_60d_status: Number(r.roi_60d_status) as 1 | 2 | 3,
        roi_90d_status: Number(r.roi_90d_status) as 1 | 2 | 3,
        roi_value: r.roi_value != null ? Number(r.roi_value) : null,
        roi_status: Number(r.roi_status) as 1 | 2 | 3,
        roi_reason: ROI_REASON_MAP[Number(r.roi_status) as 1 | 2 | 3],
        moving_avg: r.moving_avg != null ? Number(r.moving_avg) : null,
      })),
      meta: { collection_date: collectionDate },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation failed", details: err.errors });
      return;
    }
    console.error("[roi] query error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
