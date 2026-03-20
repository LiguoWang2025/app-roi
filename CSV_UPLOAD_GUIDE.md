# CSV 上传功能使用说明

## 功能特性

### 1. 数据去重与覆盖
- ✅ 使用 PostgreSQL 的 `ON CONFLICT` 语句实现 UPSERT
- ✅ 基于唯一键 `(stat_date, app_id, country)` 自动识别重复数据
- ✅ 重复数据自动覆盖更新，确保数据最新性

### 2. 并发控制
- ✅ 使用 PostgreSQL  advisory lock (`pg_advisory_xact_lock`)
- ✅ 事务级别锁，确保并发上传时的数据一致性
- ✅ 自动排队处理，避免数据冲突

### 3. 性能优化
- ✅ 批量插入（每批 200 条记录）
- ✅ 事务处理，减少数据库往返次数
- ✅ 文件大小限制：50MB
- ✅ 临时文件自动清理

## API 接口

### POST /api/upload

**请求参数：**
- `file`: CSV 文件（表单字段名）
- `collection_date`: 可选，数据收集日期（格式：YYYY-MM-DD）

**响应格式：**
```json
{
  "success": true,
  "imported": 100,
  "collection_date": "2025-07-13",
  "errors": []
}
```

**错误响应：**
```json
{
  "message": "错误信息"
}
```

## 前端使用

### 上传步骤

1. 点击页面右上角的 **"上传 CSV"** 按钮
2. 在弹出的对话框中：
   - 点击"点击上传"选择文件
   - 或将 CSV 文件拖拽到上传区域
3. 系统自动上传并处理数据
4. 查看上传结果：
   - ✓ 成功导入的行数
   - ✓ 数据日期
   - ✓ 错误信息（如有）

### CSV 文件格式要求

```csv
日期，app，出价类型，国家地区，应用安装。总次数，当日 ROI,1 日 ROI,3 日 ROI,7 日 ROI,14 日 ROI,30 日 ROI,60 日 ROI,90 日 ROI
2025-07-01(二),App-1,CPI，美国，1000,5.5%,12.3%,25.8%,55.2%,95.6%,165.3%,285.7%,350.2%
```

**必填字段：**
- `日期`: 格式为 `YYYY-MM-DD(周)` 
- `app`: App-1 到 App-5
- `出价类型`: 如 CPI
- `国家地区`: 美国 或 英国
- `应用安装。总次数`: 整数
- `ROI 列`: 百分比格式（如 5.5%）

## 技术实现细节

### 后端实现

**文件：** `apps/server/src/services/import/csvImporter.ts`

```typescript
// 1. 获取事务锁，防止并发冲突
await acquireImportLock(client);

// 2. 批量插入，每批 200 条
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  await insertBatch(client, batch);
}

// 3. UPSERT 逻辑
INSERT INTO roi_metrics (...)
VALUES (...)
ON CONFLICT (stat_date, app_id, country)
DO UPDATE SET ...
```

### 前端实现

**组件：** `apps/web/components/CsvUploader.tsx`

- 支持点击上传和拖拽上传
- 实时上传进度显示
- 错误处理和结果显示
- 自动清理文件输入

## 测试

### 使用测试文件

项目包含一个测试 CSV 文件：`data/test_upload.csv`

### 测试步骤

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问前端页面：
   ```
   http://localhost:3000
   ```

3. 点击"上传 CSV"按钮

4. 选择 `data/test_upload.csv` 文件

5. 验证上传结果

### 并发测试

可以同时上传多个文件，系统会自动处理并发：

```bash
# 终端 1
curl -X POST http://localhost:3001/api/upload \
  -F "file=@data/test_upload.csv"

# 终端 2（同时执行）
curl -X POST http://localhost:3001/api/upload \
  -F "file=@data/app_roi_data.csv"
```

## 注意事项

1. **文件大小限制**: 最大 50MB
2. **文件格式**: 仅支持 CSV 格式
3. **数据覆盖**: 重复数据会被覆盖，请谨慎操作
4. **并发安全**: 系统自动处理并发，无需手动干预
5. **错误处理**: 解析失败的行会在响应中返回，不影响其他数据

## 故障排除

### 上传失败

- 检查文件格式是否为 CSV
- 检查文件大小是否超过 50MB
- 查看浏览器控制台错误信息
- 检查后端日志

### 数据未更新

- 检查 CSV 数据格式是否正确
- 查看返回的错误信息
- 确认数据库连接正常

### 并发冲突

系统会自动处理并发冲突，如果遇到问题：
- 查看后端日志中的锁等待信息
- 确认没有其他导入操作正在进行
