## [2026-03-20] 环境变量配置

### Issue
项目需要正确配置环境变量读取机制，确保前后端都能正确读取 .env 文件中的配置。

### Cause
项目需要：
1. 统一的环境变量管理
2. 前后端分离的环境变量配置
3. TypeScript 类型支持
4. 安全性（.env 文件不应提交到版本控制）

### Solution
创建了以下配置：

**1. 环境变量文件结构：**
- `/Users/wangliguo/www/Ad-ROI/.env` - 根目录环境配置（通用）
- `/Users/wangliguo/www/Ad-ROI/apps/server/.env` - 后端专用配置
- `/Users/wangliguo/www/Ad-ROI/apps/web/.env` - 前端专用配置
- `/Users/wangliguo/www/Ad-ROI/.env.example` - 示例配置（可提交）

**2. 后端配置（Express + dotenv）：**
- 已在 `src/index.ts` 配置 `import "dotenv/config"`
- 自动读取 `.env` 文件
- 创建类型定义：`src/types/env.d.ts`

**3. 前端配置（Next.js）：**
- Next.js 自动读取 `.env`、`.env.local` 文件
- `NEXT_PUBLIC_` 前缀的变量会暴露给客户端
- 创建类型定义：`types/env.d.ts`

**4. 环境变量说明：**

后端环境变量：
- `POSTGRES_USER` - 数据库用户名
- `POSTGRES_PASSWORD` - 数据库密码
- `POSTGRES_DATABASE` - 数据库名称
- `POSTGRES_HOST` - 数据库主机
- `POSTGRES_PORT` - 数据库端口
- `SERVER_PORT` - 服务器端口 (3001)
- `NODE_ENV` - 运行环境
- `CORS_ORIGIN` - CORS 允许的源

前端环境变量：
- `NEXT_PUBLIC_API_URL` - API 服务器地址 (http://localhost:3001)

**5. 安全性：**
- `.gitignore` 已配置忽略 `.env` 文件
- 只有 `.env.example` 可以提交到版本控制

**使用方式：**
1. 复制 `.env.example` 到各应用的 `.env` 文件
2. 根据实际环境修改配置
3. 重启开发服务器使配置生效
