import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import importRouter from "./routes/import";
import roiRouter from "./routes/roi";

// 加载环境变量：优先读取本地 .env，如果不存在则读取根目录 .env
dotenv.config({
  path: [
    // path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
  ],
});

const app = express();
const PORT = process.env.SERVER_PORT ?? 3001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", importRouter);
app.use("/api", roiRouter);

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

export default app;
