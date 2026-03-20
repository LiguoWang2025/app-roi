# 快速启动指南

## 🚀 立即启动

### 1. 启动数据库（如未运行）
```bash
npm run db:up
```

### 2. 启动开发服务器
```bash
npm run dev
```

这会同时启动：
- **前端**: http://localhost:3000
- **后端**: http://localhost:3001

### 3. 验证连接

**测试后端 API：**
```bash
curl http://localhost:3001/health
```

**测试前端代理：**
```bash
curl http://localhost:3000/health
```

两个都应该返回相同的健康检查响应。

### 4. 使用上传功能

1. 访问 http://localhost:3000
2. 点击右上角的 **"上传 CSV"** 按钮
3. 选择或拖拽 CSV 文件（如 `data/test_upload.csv`）
4. 等待上传完成并查看结果

## 📝 配置说明

### API 代理配置

Next.js 14 使用 `rewrites` 将 `/api/*` 请求代理到后端：

- **前端请求**: `http://localhost:3000/api/upload`
- **代理到**: `http://localhost:3001/api/upload`

### CORS 配置

后端已配置 CORS，允许来自前端的请求：

```typescript
cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})
```

## 🔧 故障排除

### 问题：前端无法访问后端

**检查后端是否运行：**
```bash
curl http://localhost:3001/health
```

如果后端未运行，手动启动：
```bash
cd apps/server
npm run dev
```

### 问题：CORS 错误

1. 确保后端 `.env.local` 文件存在
2. 检查 CORS 配置是否正确
3. 清除浏览器缓存

### 问题：代理不工作

清除 Next.js 缓存并重启：
```bash
rm -rf apps/web/.next
npm run dev
```

## 📦 环境变量

确保以下文件存在：

**apps/web/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**apps/server/.env.local:**
```
SERVER_PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=adroi
POSTGRES_PASSWORD=adroi_secret
POSTGRES_DB=ad_roi
```

## ✅ 验证清单

- [ ] 数据库正在运行
- [ ] 后端服务响应健康检查
- [ ] 前端服务可以访问
- [ ] 前端代理可以访问后端 API
- [ ] CSV 上传功能正常工作

## 🎯 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/upload` | POST | 上传 CSV（推荐） |
| `/api/import` | POST | 导入 CSV（旧） |
| `/api/roi` | GET | 获取 ROI 数据 |

## 📚 更多文档

- [CSV 上传功能说明](./CSV_UPLOAD_GUIDE.md)
- [API 代理配置详情](./API_PROXY_SETUP.md)
