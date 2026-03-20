import { Pool } from "pg";

let pool: Pool | null = null;

export async function initDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  console.log("🔍 加载数据库配置...");
  console.log("POSTGRES_URL:", process.env.POSTGRES_URL ? "已配置" : "未配置");
  console.log("POSTGRES_HOST:", process.env.POSTGRES_HOST);
  console.log("POSTGRES_USER:", process.env.POSTGRES_USER);
  console.log("POSTGRES_DATABASE:", process.env.POSTGRES_DATABASE);

  // 优先使用 POSTGRES_URL（Neon 等云数据库），否则使用独立参数
  const config = process.env.POSTGRES_URL
    ? {
        connectionString: process.env.POSTGRES_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: false,
        // process.env.NODE_ENV === "production"
        //   ? { rejectUnauthorized: false }
        //   : false,
      }
    : {
        host: process.env.POSTGRES_HOST ?? "localhost",
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        user: process.env.POSTGRES_USER ?? "app_roi",
        password: process.env.POSTGRES_PASSWORD ?? "app_roi_secret",
        database: process.env.POSTGRES_DATABASE ?? "ad_roi",
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      };

  pool = new Pool(config);

  // 测试数据库连接
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("✅ 数据库连接成功！");
  } catch (error) {
    console.error("❌ 数据库连接失败:", error);
    throw new Error(
      `数据库连接失败：${error instanceof Error ? error.message : "未知错误"}`,
    );
  }

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error("数据库未初始化！请先调用 initDatabase()");
  }
  return pool;
}

// 优雅关闭数据库连接
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log("数据库连接已关闭");
    pool = null;
  }
}
