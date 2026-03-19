---
name: "problem-logger"
description: "Automatically logs and summarizes problems encountered during development. Invoke when a problem is resolved to record the issue, cause, and solution."
---

# Problem Logger

This skill automatically records problems encountered during development for future reference.

## When to Invoke

**MUST invoke this skill IMMEDIATELY when:**
- A problem/bug/error has been resolved
- A configuration issue has been fixed
- A compatibility issue has been addressed
- Any non-trivial issue that required investigation

## Problem Log Format

Each problem should be recorded in `.trae/problem-log.md` with the following structure:

```markdown
## [YYYY-MM-DD] Problem Title

### Issue
Description of the problem encountered.

### Cause
Root cause analysis of why the problem occurred.

### Solution
Steps taken to resolve the problem.

### Prevention
How to avoid this problem in the future (optional).
```

## Current Problems Logged

### [2026-03-19] Next.js 14.2.x 不支持 next.config.ts

**Issue:** Next.js 14.2.x 版本报错：`Configuring Next.js via 'next.config.ts' is not supported`

**Cause:** Next.js 14.2.x 版本不支持 TypeScript 格式的配置文件，只支持 `.js` 或 `.mjs` 格式。

**Solution:** 将 `next.config.ts` 重命名为 `next.config.mjs`，并使用 CommonJS 格式导出配置。

### [2026-03-19] Tailwind CSS 不识别 border-border 类

**Issue:** Tailwind CSS 报错：`The 'border-border' class does not exist`

**Cause:** shadcn/ui 组件使用了 CSS 变量作为颜色值（如 `border-border`），但 Tailwind 配置中没有定义这些变量的映射。

**Solution:** 在 `tailwind.config.ts` 的 `theme.extend.colors` 中添加所有 shadcn 需要的 CSS 变量映射：
```typescript
colors: {
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  // ... 其他变量
}
```

### [2026-03-19] Tailwind CSS 不识别 outline-ring/50 类

**Issue:** Tailwind CSS 报错：`The 'outline-ring/50' class does not exist`

**Cause:** `outline-ring/50` 不是有效的 Tailwind CSS 类，Tailwind 不支持对自定义颜色的 outline 使用透明度修饰符。

**Solution:** 从 `globals.css` 中移除 `outline-ring/50` 类，只保留 `border-border` 类。

## Usage Instructions

1. When a problem is resolved, append a new entry to `.trae/problem-log.md`
2. Use clear, concise language to describe the issue
3. Include code snippets when helpful
4. Tag with relevant categories (e.g., [Next.js], [Tailwind], [shadcn])
