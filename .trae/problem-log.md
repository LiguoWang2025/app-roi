## [2026-03-20] 响应式设计和暗色模式实现

### Issue
需要为 Ad-ROI 项目添加响应式设计和暗色模式支持，以提升用户体验和可访问性。

### Cause
项目初始版本缺少：
1. 暗色模式切换功能
2. 完整的响应式布局优化
3. 暗色模式下的 UI 组件样式适配

### Solution
实现了以下功能：

1. **创建暗色模式切换组件** (`ThemeToggle.tsx`)
   - 使用 localStorage 持久化用户偏好
   - 支持系统偏好检测
   - 提供太阳/月亮图标切换

2. **更新全局样式** (`globals.css`)
   - 添加 scroll-smooth 到 html
   - 添加字体特性设置
   - 确保暗色模式 CSS 变量正确应用

3. **优化主页面响应式布局** (`page.tsx`)
   - 使用 Tailwind 响应式类 (sm:, md:)
   - 优化移动端内边距和间距
   - 添加暗色模式支持到所有 UI 元素
   - 集成 ThemeToggle 组件

4. **更新组件暗色模式支持**
   - `FilterPanel.tsx`: 添加 bg-card text-card-foreground 类
   - `ROITrendChart.tsx`: 添加暗色模式样式，更新 CartesianGrid  stroke 颜色
   - `UploadModal.tsx`: 添加背景色和暗色模式遮罩层
   - `CsvUploader.tsx`: 优化拖拽区域暗色模式样式

5. **布局改进**
   - 移动端：p-4, text-xl
   - 平板：p-6
   - 桌面：p-8, text-2xl
   - 最大宽度从 max-w-6xl 提升到 max-w-7xl

所有更改已完成并通过 TypeScript 类型检查，无编译错误。
