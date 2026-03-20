# Ad-ROI

一个基于真实广告投放数据的 ROI 分析系统，采用前后端分离的 Monorepo 结构：

- 前端：`Next.js 14`（`apps/web`）
- 后端：`Express + TypeScript`（`apps/server`）
- 数据库：`PostgreSQL 16`

系统支持 CSV 数据导入、ROI 多周期查询、移动平均趋势展示、筛选与对数坐标分析。

## 目录结构

```bash
Ad-ROI/
├── apps/
│   ├── web/                 # Next.js 前端
│   └── server/              # Express 后端
├── data/                    # CSV 数据目录（默认 data/app_roi_data.csv）
├── docker-compose.yml       # PostgreSQL 容器
├── .env.example
├── DESIGN.md
├── USER_GUIDE.md
└── DEPLOYMENT.md
```

## 环境要求

- Node.js `>= 18`
- npm `>= 9`
- PostgreSQL `>= 16`（可使用 Docker 一键启动）

## 快速启动（开发环境）

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

3. 启动数据库（Docker）

```bash
npm run db:up
```

4. 执行数据库迁移

```bash
npm run db:migrate --workspace=apps/server
```

5. 导入 CSV 数据（可选但推荐）

```bash
npm run data:import
```

6. 启动前后端

```bash
npm run dev
```

7. 访问系统

- 前端：`http://localhost:3000`
- 后端健康检查：`http://localhost:3001/health`

## 常用脚本

- `npm run dev`：同时启动前后端开发服务
- `npm run build`：构建前后端
- `npm run data:import`：执行 CSV 导入
- `npm run db:up`：启动 PostgreSQL 容器
- `npm run db:down`：停止容器
- `npm run db:reset`：重建数据库卷并重启 PostgreSQL

## 关键接口

- `GET /api/roi`：查询 ROI 数据（支持筛选、周期与移动平均参数）
- `POST /api/import`：上传 CSV 并导入数据库
- `GET /health`：服务健康状态

详细设计请查看 `DESIGN.md`，使用流程请查看 `USER_GUIDE.md`，部署细节请查看 `DEPLOYMENT.md`。
