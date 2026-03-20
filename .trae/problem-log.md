## [2026-03-20] 数据库异步加载实现

### Issue

数据库连接需要在应用启动时异步初始化，而不是在模块加载时同步创建。这样可以：

1. 确保环境变量已正确加载
2. 提供连接测试和错误处理
3. 支持优雅关闭和连接管理
4. 支持云数据库（如 Neon）的连接配置

### Cause

原实现使用同步方式创建数据库连接池：

- 模块加载时立即创建 Pool 实例
- 无法测试连接是否成功
- 没有错误处理机制
- 不支持优雅关闭

### Solution

重构了数据库连接为异步初始化模式：

**1. 数据库模块重构 (`src/models/db.ts`)：**

- `initDatabase()`: 异步初始化函数，测试连接并返回 Pool 实例
- `getPool()`: 获取已初始化的 Pool 实例
- `closeDatabase()`: 优雅关闭数据库连接
- 支持 Neon 等云数据库的 POSTGRES_URL 连接字符串
- 生产环境自动启用 SSL
- 连接失败时抛出详细错误信息

**2. 主入口更新 (`src/index.ts`)：**

- `startServer()`: 异步启动函数，先初始化数据库再启动服务器
- 添加 SIGINT 和 SIGTERM 信号处理
- 优雅关闭时释放数据库连接
- 启动失败时自动退出进程

**3. 路由和 Service 更新：**

- `routes/roi.ts`: 使用 `getPool()` 获取连接池
- `services/import/csvImporter.ts`: 使用 `getPool()` 获取连接池
- `db/migrate.ts`: 使用 `initDatabase()` 和 `closeDatabase()`
- `services/import/run.ts`: 使用 `initDatabase()` 和 `closeDatabase()`

**4. 连接配置优先级：**

- 优先使用 `POSTGRES_URL` (Neon 等云数据库)
- 回退到独立参数配置 (POSTGRES_HOST, POSTGRES_USER 等)
- 从根目录 `.env` 文件加载配置

**5. 错误处理：**

- 连接失败时显示详细错误信息
- 启动失败时优雅退出
- 迁移脚本添加 try-catch 和错误处理

**使用示例：**

```typescript
// 应用启动
await initDatabase();
const pool = getPool();

// 优雅关闭
await closeDatabase();
```

**日志输出：**

```
🔍 加载数据库配置...
POSTGRES_URL: 已配置
POSTGRES_HOST: ep-lucky-violet-adhlu6hz-pooler.c-2.us-east-1.aws.neon.tech
POSTGRES_USER: neondb_owner
POSTGRES_DATABASE: neondb
✅ 数据库连接成功！
🚀 [server] listening on http://localhost:3001
```
