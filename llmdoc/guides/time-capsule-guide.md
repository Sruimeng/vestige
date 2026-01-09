---
id: time-capsule-guide
type: guide
related_ids:
  - prd
  - design-guide
---

# Time Capsule 使用指南

## 1. 概述

**Time Capsule（时间胶囊）** 是一个"历史在物体中"的功能模块，允许用户查询任意年份（公元前500年到公元2100年）并获得该年份的合成历史物体。

## 2. 核心类型定义

```typescript
/** 时间胶囊响应数据 */
interface TimeCapsuleResponse {
  data: TimeCapsuleData;
}

interface TimeCapsuleData {
  year: number;              // 年份数值
  year_display: string;      // 年份显示文本 (e.g., "公元 1984 年")
  events: HistoryEvent[];    // 历史事件列表 (3-5 条)
  symbols: string[];         // 文化符号列表 (3-5 个)
  synthesis: string;         // 合成物体描述 (50 字内)
  philosophy: string;        // 时代哲学评判 (80 字内)
  model_url: string;         // 3D 模型 URL (.glb)
  generated_at: string;      // ISO 8601 生成时间
}

interface HistoryEvent {
  title: string;
  description: string;
  category: EventCategory;
}

type EventCategory = 'politics' | 'technology' | 'culture' | 'economy' | 'science';

/** 错误响应 */
interface ErrorResponse {
  error: 'invalid_year' | 'generation_failed';
  message: string;
}
```

## 3. 核心流程

```
FUNCTION getTimeCapsule(year: number):
  1. VALIDATE year IN [-500, 2100]
     - IF year === 0 THEN year = 1  // 历史上无公元0年
     - IF OUT_OF_RANGE THEN RETURN 400 invalid_year
  
  2. CHECK cache IN database
     - IF HIT THEN RETURN cached_data (< 100ms)
  
  3. GENERATE new capsule (~60s)
     - CALL LLM API → get events, symbols, synthesis, philosophy
     - CALL Tripo AI → get model_url (.glb)
     - SAVE to database
  
  4. RETURN TimeCapsuleData
```

## 4. API 规范

### 4.1 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/time-capsule/{year}` | 获取指定年份的时间胶囊 |

### 4.2 路径参数

| 参数 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `year` | integer | -500 到 2100 | 目标年份（负数表示公元前） |

### 4.3 响应状态码

| 状态码 | 场景 | 响应体 |
|--------|------|--------|
| 200 | 成功 | `TimeCapsuleResponse` |
| 400 | 年份无效 | `ErrorResponse { error: 'invalid_year' }` |
| 500 | 生成失败 | `ErrorResponse { error: 'generation_failed' }` |

## 5. 环境配置

```bash
# .env 必需配置
DATABASE_URL=sqlite:./data/reify-sdk.db?mode=rwc
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
LLM_BASE_URL=https://api.anthropic.com/v1/messages
LLM_MODEL=claude-3-5-sonnet-20241022
TRIPO_API_KEY=tsz-xxxxxxxxxxxxxxxxxxxxxxxx
HOST=0.0.0.0
PORT=3000
```

## 6. 性能特性

| 场景 | 响应时间 | 说明 |
|------|----------|------|
| 缓存命中 | < 100ms | 直接从数据库返回 |
| 首次生成 | ~60s | LLM + Tripo 生成 |

## 7. 文件结构

```
src/api/time_capsule/
├── mod.rs          # 模块入口和路由定义
├── types.rs        # 数据类型定义
└── handlers.rs     # HTTP 请求处理器

src/
├── fetcher.rs      # LLM 调用和数据生成
└── db.rs           # 数据库操作
```

## 8. ⛔ 禁止事项 (Do NOTs)

- 🚫 不要请求超出 [-500, 2100] 范围的年份
- 🚫 不要对同一年份发起并发生成请求
- 🚫 不要在未配置 `LLM_API_KEY` 和 `TRIPO_API_KEY` 的情况下启动服务
- 🚫 不要假设公元 0 年存在（系统会自动映射到公元 1 年）
- 🚫 不要在首次生成时设置过短的超时时间（需要 ~60s）

## 9. 测试检查清单

- [ ] 服务启动成功
- [ ] 健康检查返回 `OK`
- [ ] 正数年份请求成功
- [ ] 负数年份（公元前）请求成功
- [ ] 年份 0 自动映射到 1
- [ ] 超出范围年份返回 400
- [ ] 缓存命中时即时返回
- [ ] 3D 模型 URL 可访问