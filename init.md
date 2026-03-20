# 🚀 AppInsight ROI - 多维度广告数据分析系统

> **项目定位**：基于真实移动应用广告投放数据的全栈 ROI 分析平台，旨在解决广告投放中的数据滞后性、ROI 归因及趋势预测问题。

---

## 📖 项目简介

**AppInsight ROI** 是一款为移动应用出海团队设计的专业看板。系统通过对 `app_roi_data.csv` 原始数据的深度清洗与二次建模，实现了对 App-1 至 App-5 五款应用在美、英市场的投放表现监控。

### 核心亮点：

- **业务逻辑闭环**：精准区分“真实 0%”与“数据统计周期不足（T+N）”导致的 0%，避免决策误导。
- **多维趋势分析**：内置 **7 日移动平均（7-Day Moving Average）** 算法，平滑原始数据波动，揭示真实回本趋势。
- **高性能架构**：采用 Next.js 14 + Node.js + PostgreSQL 架构，支持海量数据的高效筛选与秒级渲染。

---

## 🛠️ 技术栈选型


| 层面       | 技术选型                               | 说明                                |
| -------- | ---------------------------------- | --------------------------------- |
| **前端**   | **Next.js 14 (App Router)**        | 利用 React Server Components 提升加载性能 |
| **可视化**  | **Recharts + Tailwind CSS**        | 响应式图表，支持对数刻度与虚线预测显示               |
| **后端**   | **Node.js (Express) + TypeScript** | 强类型约束，确保数据接口的健壮性                  |
| **数据库**  | **PostgreSQL**                     | 复杂 SQL 查询（窗口函数计算移动平均）             |
| **数据处理** | **fast-csv**                       | 高效解析 CSV 原始文件并进行自动化清洗             |


---

## 📊 核心业务逻辑设计

### 1. 数据完整性标识（Status Mask）

为了区分两种 0% 情况，我们在数据库中对每一行数据引入了 `data_status` 标记：

- **Valid (1)**：数据已过统计周期（如 90 日 ROI 在 90 天后统计）。
- **Pending (2)**：统计周期不足（如 5 月 1 日的数据，在 5 月 10 日看其 30 日 ROI），前端显示为**虚线**或**Tooltip 提示**。
- **Zero (3)**：真实 ROI 为 0（已过周期但无收益）。

### 2. 统计维度说明

- **移动平均线**：默认显示 7 日均值，公式为：$MA_7 = \frac{1}{7} \sum_{i=0}^{6} ROI_{t-i}$。
- **100% 回本线**：图表中显著标注红色基准线，直观判定各 App 的回本速度。
- **坐标轴切换**：支持 **Linear（线性）** 观察绝对值，支持 **Log（对数）** 观察早期爆发式增长。

---

## 📂 项目结构规范

```bash
├── apps/web                # Next.js 前端应用
│   ├── components/charts   # ROI 趋势图核心组件
│   ├── hooks/useROI        # 数据请求与筛选逻辑
│   └── lib/utils           # 移动平均算法与格式化
├── apps/server             # Node.js 后端服务
│   ├── src/services/import # CSV 批量导入逻辑
│   ├── src/models          # 数据库 Schema 定义
│   └── src/controllers     # 数据查询 API
├── data/                   # 原始 CSV 文件存放处
└── docs/                   # 面试要求的三份核心文档 (DESIGN, USER_GUIDE, DEPLOY)
```

---

## 📝 数据库表结构 (Schema)

```sql
CREATE TABLE roi_metrics (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,          -- 投放日期
    app_id VARCHAR(50),               -- App 名称 (App-1..5)
    country VARCHAR(10),              -- 国家 (US/UK)
    bid_type VARCHAR(20),             -- 出价类型 (CPI)
    installs INTEGER,                 -- 安装数
    roi_0d DECIMAL(10, 4),            -- 当日 ROI
    -- ... 省略 1d, 3d, 7d ...
    roi_90d DECIMAL(10, 4),           -- 90日 ROI
    valid_mask INTEGER                -- 状态掩码，用于区分日期不足
);
```

---

## 🚀 快速启动

1. **环境配置**：确保已安装 Node.js 18+ 和 PostgreSQL。
2. **依赖安装**：`npm install`
3. **数据导入**：
  - 将 `app_roi_data.csv` 放入 `/data` 目录。
    - 执行 `npm run data:import`（触发后端解析并写入 DB）。
4. **启动开发环境**：`npm run dev`
5. **访问地址**：`http://localhost:3000`

---

### 💡 建议后续步骤：

1. **需要我为你生成具体的 `DESIGN.md`（系统设计文档）吗？** 里面会包含更详细的 API 定义和组件架构。
2. **还是先帮你写出处理 CSV 并识别“日期不足”逻辑的代码片段？**

