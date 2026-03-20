# API 代理配置说明

## 问题原因

Next.js 14 使用 `rewrites` 进行 API 代理时，在开发环境下需要特殊配置。

## 已完成的配置

### 1. Next.js 配置 (`apps/web/next.config.mjs`)

```javascript
const nextConfig = {
  async rewrites() {
    const api_url = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${api_url}/api/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};
```

### 2. 环境变量配置

**前端环境变量** (`apps/web/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**后端环境变量** (`apps/server/.env.local`):

```
SERVER_PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=adroi
POSTGRES_PASSWORD=adroi_secret
POSTGRES_DB=ad_roi
```

### 3. CORS 配置 (`apps/server/src/index.ts`)

```typescript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

## 启动步骤

### 方式一：同时启动前后端（推荐）

```bash
npm run dev
```

这会同时启动：

- 前端：http://localhost:3000
- 后端：http://localhost:3001

### 方式二：分别启动

**启动后端：**

```bash
cd apps/server
npm run dev
```

**启动前端（新终端）：**

```bash
cd apps/web
npm run dev
```

## 验证 API 连接

### 1. 测试后端健康检查

```bash
curl http://localhost:3001/health
```

预期响应：

```json
{
  "status": "ok",
  "timestamp": "2025-03-20T..."
}
```

### 2. 测试前端代理

访问：http://localhost:3000/health

应该能看到与直接访问后端相同的响应。

### 3. 测试上传 API

```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data/test_upload.csv"
```

## 常见问题排查

### 问题 1: 前端无法访问后端 API

**症状：** 前端请求返回 404 或网络错误

**解决方案：**

1. 确保后端服务正在运行：`curl http://localhost:3001/health`
2. 检查 `.env.local` 文件是否存在且配置正确
3. 重启开发服务器

### 问题 2: CORS 错误

**症状：** 浏览器控制台显示 CORS 相关错误

**解决方案：**

1. 检查后端 CORS 配置是否包含前端地址
2. 确保前后端都在正确的端口运行
3. 清除浏览器缓存后重试

### 问题 3: 代理不工作

**症状：** 请求没有转发到后端

**解决方案：**

1. 检查 `next.config.mjs` 中的 rewrites 配置
2. 确保 `NEXT_PUBLIC_API_URL` 环境变量正确
3. 重启 Next.js 开发服务器（清除 .next 缓存）

```bash
rm -rf .next
npm run dev
```

## API 端点列表

| 端点          | 方法 | 描述          |
| ------------- | ---- | ------------- |
| `/health`     | GET  | 健康检查      |
| `/api/import` | POST | 导入 CSV 文件 |
| `/api/roi`    | GET  | 获取 ROI 数据 |

## 文件结构

```
apps/
├── web/
│   ├── .env.local              # 前端环境变量
│   ├── next.config.mjs         # Next.js 配置（含代理）
│   └── components/
│       ├── CsvUploader.tsx     # CSV 上传组件
│       └── UploadModal.tsx     # 上传弹窗
└── server/
    ├── .env.local              # 后端环境变量
    └── src/
        ├── index.ts            # 后端入口（含 CORS）
        └── routes/
            └── import.ts       # 导入路由（含 upload）
```

## 下一步

配置完成后，访问 http://localhost:3000 并点击"上传 CSV"按钮即可使用上传功能。
