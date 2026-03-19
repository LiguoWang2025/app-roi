import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { roiQuerySchema } from '../schemas/roiQuerySchema';
import { roiStatusExpr, type RoiPeriod } from '../models/schema';
import { pool } from '../models/db';

const router = Router();

router.get('/roi', async (req: Request, res: Response) => {
  try {
    const query = roiQuerySchema.parse(req.query);
    const { app_id, country, start_date, end_date, roi_period, ma_days } = query;

    const roiCol = `roi_${roi_period}`;
    const statusExpr = roiStatusExpr(roi_period as RoiPeriod);

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

    const innerWhere = innerConds.length > 0 ? `WHERE ${innerConds.join(' AND ')}` : '';
    const outerWhere = outerConds.length > 0 ? `WHERE ${outerConds.join(' AND ')}` : '';

    const sql = `
      WITH base AS (
        SELECT
          r.stat_date,
          r.app_id,
          r.country,
          r.installs,
          r.${roiCol}  AS roi_value,
          (${statusExpr}) AS roi_status,
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

    const collectionDate: string | null = metaResult.rows[0]?.collection_date ?? null;

    res.json({
      data: dataResult.rows.map((r) => ({
        stat_date: r.stat_date,
        app_id: r.app_id,
        country: r.country,
        installs: Number(r.installs),
        roi_value: r.roi_value != null ? Number(r.roi_value) : null,
        roi_status: Number(r.roi_status),
        moving_avg: r.moving_avg != null ? Number(r.moving_avg) : null,
      })),
      meta: { collection_date: collectionDate },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', details: err.errors });
      return;
    }
    console.error('[roi] query error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
