---
id: technical-debt
type: reference
related_ids: [doc-standard]
---

# 🏥 技术债务报告

> **审计日期**: 2026-01-07
> **审计范围**: React 模板仓库废弃代码清理
> **清理状态**: ✅ 已完成

## 📊 审计摘要

| 类别 | 发现数量 | 已清理 | 状态 |
|------|----------|--------|------|
| 🔴 废弃业务代码 | 6 处 | 6 处 | ✅ |
| 🟡 外部依赖问题 | 2 处 | 2 处 | ✅ |
| 🟠 代码质量问题 | 2 处 | 2 处 | ✅ |
| 📦 缺失依赖 | 4 个包 | 4 个包 | ✅ |

---

## 🔴 废弃业务代码 (Tripo GameHub 残留)

### ✅ DEBT-001: Tripo CDN/Web URL 硬编码

- **文件**: [`app/constants/static/service.ts`](../../app/constants/static/service.ts:1)
- **状态**: ✅ 已清理
- **操作**: 替换为模板占位符

### ✅ DEBT-002: 业务枚举定义

- **文件**: [`app/constants/static/enum.ts`](../../app/constants/static/enum.ts:1)
- **状态**: ✅ 已清理
- **操作**: 移除 `Subscription`, `NavigateEnum`, `PageUrl`，保留 `Period`

### ✅ DEBT-003: Tripo API/WS/Auth 全套配置

- **文件**: [`app/constants/meta/service.ts`](../../app/constants/meta/service.ts:1)
- **状态**: ✅ 已清理
- **操作**: 替换为模板化配置

### ✅ DEBT-004: 业务导航 Hooks

- **文件**: [`app/hooks/navigate.ts`](../../app/hooks/navigate.ts:1)
- **状态**: ✅ 已清理
- **操作**: 移除 `useToHome`, `useToEvent`, `useToCommunity`, `useToGames`，保留 `useNavigateWithQuery`

### ✅ DEBT-005: goLogin 函数

- **文件**: [`app/utils/utils.ts`](../../app/utils/utils.ts:1)
- **状态**: ✅ 已清理
- **操作**: 移除 `goLogin` 函数

### ✅ DEBT-006: isEventActive 业务函数

- **文件**: [`app/utils/utils.ts`](../../app/utils/utils.ts:1)
- **状态**: ✅ 已清理
- **操作**: 移除 `isEventActive` 函数

---

## 🟡 外部依赖问题

### ✅ DEBT-007: @tripo/design 依赖 (Loading)

- **文件**: [`app/hooks/request.ts`](../../app/hooks/request.ts:1)
- **状态**: ✅ 已清理
- **操作**: 替换为原生 React state 管理

### ✅ DEBT-008: @tripo/design 依赖 (copy)

- **文件**: [`app/utils/utils.ts`](../../app/utils/utils.ts:1)
- **状态**: ✅ 已清理
- **操作**: 替换为原生 `navigator.clipboard.writeText`

---

## 📦 缺失依赖

| 包名 | 状态 | 操作 |
|------|------|------|
| `@tripo/design` | ✅ 已移除 | 不再依赖 |
| `@aws-sdk/client-s3` | ✅ 已移除 | 删除 resource.ts |
| `@aws-sdk/lib-storage` | ✅ 已移除 | 删除 resource.ts |
| `@baiducloud/sdk` | ✅ 已移除 | 删除 resource.ts |

---

## 🟠 代码质量问题

### ✅ DEBT-009: console.log 调试代码

- **文件**: `app/utils/resource.ts` (已删除)
- **状态**: ✅ 已清理
- **操作**: 删除整个文件

---

## 📋 清理任务清单

### Phase 1: 删除废弃文件/代码 ✅

- [x] **DEBT-001**: 清空 `app/constants/static/service.ts`
- [x] **DEBT-002**: 清理 `app/constants/static/enum.ts` - 移除业务枚举
- [x] **DEBT-003**: 重写 `app/constants/meta/service.ts` - 模板化配置
- [x] **DEBT-004**: 清理 `app/hooks/navigate.ts` - 只保留 `useNavigateWithQuery`
- [x] **DEBT-005**: 清理 `app/utils/utils.ts` - 移除 `goLogin`
- [x] **DEBT-006**: 清理 `app/utils/utils.ts` - 移除 `isEventActive`

### Phase 2: 处理依赖问题 ✅

- [x] **DEBT-007**: 移除 `@tripo/design` Loading 依赖
- [x] **DEBT-008**: 移除 `@tripo/design` copy 依赖
- [x] 删除 `app/utils/resource.ts` (AWS/Baidu SDK 依赖)

### Phase 3: 代码质量 ✅

- [x] **DEBT-009**: 删除包含 `console.log` 的 resource.ts

---

## ⛔ 禁止事项 (Do NOTs)

- 🚫 不要在模板中保留业务特定的 URL/API 配置
- 🚫 不要依赖私有 npm 包 (`@tripo/*`)
- 🚫 不要使用 `console.log` 作为用户提示
- 🚫 不要在 package.json 中遗漏实际使用的依赖

---

## 🔴 当前技术债务 (2026-01-12 审计)

> **审计状态**: ✅ 已修复
> **修复日期**: 2026-01-12

### CRITICAL: 内存分配违规 ✅

| ID | 文件 | 行号 | 问题 | 状态 |
|----|------|------|------|------|
| DEBT-010 | `blueprint-edge-effect.tsx` | 64 | `new Color('#00FFFF')` 在默认参数中 | ✅ 已修复 |
| DEBT-011 | `blueprint-edge-effect.tsx` | 67 | `new Vector2(1920, 1080)` 在默认参数中 | ✅ 已修复 |
| DEBT-012 | `cyber-glitch-effect.tsx` | 101 | `new Vector2(1920, 1080)` 在默认参数中 | ✅ 已修复 |

**修复方案**: 预分配为模块级常量 `DEFAULT_EDGE_COLOR`, `DEFAULT_RESOLUTION`

### HIGH: 命名违规 (Hemingway) ✅

| ID | 文件 | 行号 | 问题 | 状态 |
|----|------|------|------|------|
| DEBT-013 | `blueprint-edge-effect.tsx` | 62 | `BlueprintEdgeEffectImpl` -> `BlueprintEdge` | ✅ 已修复 |
| DEBT-014 | `cyber-glitch-effect.tsx` | 98 | `CyberGlitchEffectImpl` -> `CyberGlitch` | ✅ 已修复 |
| DEBT-015 | `scanline-effect.tsx` | 32 | `ScanlineEffectImpl` -> `Scanline` | ✅ 已修复 |

**修复方案**: 移除 `Impl` 后缀

### HIGH: 类型安全违规 ✅

| ID | 文件 | 行号 | 问题 | 状态 |
|----|------|------|------|------|
| DEBT-016 | `debounce.ts` | 5 | `any` -> `unknown` | ✅ 已修复 |
| DEBT-017 | `debounce.ts` | 13 | `any` -> `unknown` | ✅ 已修复 |

**修复方案**: 替换为 `(...args: unknown[]) => unknown`

### MEDIUM: "What" 注释违规 ✅

| ID | 文件 | 行号 | 问题 | 状态 |
|----|------|------|------|------|
| DEBT-018 | `utils.ts` | 123 | `// Check for Bilibili video - return bvid` | ✅ 已删除 |
| DEBT-019 | `utils.ts` | 132 | `// Check for YouTube video` | ✅ 已删除 |
| DEBT-020 | `crystal-material.tsx` | 272 | `// Update uniforms when props change` | ✅ 已删除 |

**修复方案**: 删除这些注释

---

## 📝 清理日志

| 日期 | 操作 |
|------|------|
| 2026-01-12 | 审计发现 11 项新技术债务 (3 CRITICAL, 5 HIGH, 3 MEDIUM) |
| 2026-01-07 | 完成全部技术债务清理 |
| 2026-01-07 | 删除 `app/utils/resource.ts` |
| 2026-01-07 | 清理 6 个废弃业务代码文件 |
| 2026-01-07 | 移除 `@tripo/design` 依赖 |