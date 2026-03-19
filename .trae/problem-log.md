# Problem Log

开发过程中遇到的问题及解决方案记录。

---

## [2026-03-19] Next.js 14.2.x 不支持 next.config.ts

### Issue
Next.js 14.2.x 版本报错：
```
Configuring Next.js via 'next.config.ts' is not supported. 
Please replace the file with 'next.config.js' or 'next.config.mjs'.
```

### Cause
Next.js 14.2.x 版本不支持 TypeScript 格式的配置文件，只支持 `.js` 或 `.mjs` 格式。

### Solution
将 `next.config.ts` 重命名为 `next.config.mjs`，并使用 CommonJS 格式导出配置：
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置内容
};

export default nextConfig;
```

---

## [2026-03-19] Tailwind CSS 不识别 border-border 类

### Issue
Tailwind CSS 报错：
```
The `border-border` class does not exist. 
If `border-border` is a custom class, make sure it is defined within a `@layer` directive.
```

### Cause
shadcn/ui 组件使用了 CSS 变量作为颜色值（如 `border-border`），但 Tailwind 配置中没有定义这些变量的映射。

### Solution
在 `tailwind.config.ts` 的 `theme.extend.colors` 中添加所有 shadcn 需要的 CSS 变量映射：
```typescript
theme: {
  extend: {
    colors: {
      background: "var(--background)",
      foreground: "var(--foreground)",
      border: "var(--border)",
      input: "var(--input)",
      ring: "var(--ring)",
      primary: {
        DEFAULT: "var(--primary)",
        foreground: "var(--primary-foreground)",
      },
      // ... 其他变量
    },
  },
}
```

---

## [2026-03-19] Tailwind CSS 不识别 outline-ring/50 类

### Issue
Tailwind CSS 报错：
```
The `outline-ring/50` class does not exist. 
If `outline-ring/50` is a custom class, make sure it is defined within a `@layer` directive.
```

### Cause
`outline-ring/50` 不是有效的 Tailwind CSS 类，Tailwind 不支持对自定义颜色的 outline 使用透明度修饰符。

### Solution
从 `globals.css` 中移除 `outline-ring/50` 类，只保留 `border-border` 类：
```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## [2026-03-19] shadcn Select 和 RadioGroup 组件类型错误

### Issue
使用 shadcn 的 Select 和 RadioGroup 组件时，TypeScript 类型检查报错：
```
Namespace 'RadioGroup' has no exported member 'Root'
Property 'Radio' does not exist on type '<Value>(props: Props<Value>) => Element'
Generic type 'Props' requires between 1 and 2 type arguments
```

### Cause
当前使用的 shadcn/ui 版本与 @base-ui/react 的 API 不兼容，组件导入和类型定义不匹配。

### Solution
直接使用原生 HTML 元素实现下拉选择和单选功能：
- 使用 `<select>` 代替 shadcn Select
- 使用 `<input type="radio">` 代替 shadcn RadioGroup
- 保持 shadcn 的样式类，但使用原生元素实现交互
