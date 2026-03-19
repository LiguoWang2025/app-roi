# Project Rules

## Problem Logging

When resolving any problem during development, ALWAYS:

1. **Log the problem** to `.trae/problem-log.md` with the following format:

```markdown
## [YYYY-MM-DD] Problem Title

### Issue
Description of the problem encountered.

### Cause
Root cause analysis of why the problem occurred.

### Solution
Steps taken to resolve the problem.
```

2. **Types of problems to log:**
   - Configuration errors
   - Compatibility issues
   - Build/compile errors
   - Runtime errors
   - Dependency conflicts
   - Framework-specific quirks

3. **When to log:**
   - Immediately after resolving a problem
   - Before moving on to the next task
   - Even if the solution seems obvious in hindsight

## Tech Stack Notes

- **Next.js**: Version 14.2.x uses `.mjs` or `.js` for config, not `.ts`
- **shadcn/ui**: Requires CSS variable mappings in Tailwind config
- **Tailwind CSS**: Custom color classes must be defined in theme.extend.colors
