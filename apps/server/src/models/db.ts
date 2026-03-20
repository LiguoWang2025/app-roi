import { Pool } from "pg";

console.log(process.env.POSTGRES_URL);
console.log(process.env.POSTGRES_PORT);
console.log(process.env.POSTGRES_USER);
console.log(process.env.POSTGRES_DATABASE);

export const pool = new Pool({
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  user: process.env.POSTGRES_USER ?? "app_roi",
  password: process.env.POSTGRES_PASSWORD ?? "app_roi_secret",
  database: process.env.POSTGRES_DATABASE ?? "ad_roi",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
