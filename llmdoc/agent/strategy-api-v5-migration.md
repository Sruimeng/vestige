---
id: strategy-api-v5-migration
type: strategy
related_ids: [data-model, time-capsule-guide, style-hemingway]
---

# Strategy: API v5.0 Migration

## 1. Analysis

**Context:** Current API uses `https://api.sruim.xin` with `/api/time-capsule/{year}` and `/api/future-fossils/{year}`. New v5.0 API restructures endpoints and response schemas.

**Constitution:**
- Ref: `style-hemingway` - Iceberg Principle, No Fluff
- Ref: `data-model` - Type definitions location
- Max nesting: 3 levels
- Early returns
- Zod validation required

**Style Protocol:** Strict Adherence to `llmdoc/reference/style-hemingway.md` (Iceberg Principle, No Fluff).

**Negative Constraints:**
- No "what" comments
- No bureaucratic suffixes (Manager, Helper, Service)
- No verbose conditionals
- No `new` in loops
- No meta-talk in code

## 2. Assessment

<Assessment>
**Complexity:** Level 2
</Assessment>

Rationale: Schema transformation + endpoint mapping. No math/physics. Standard CRUD migration.

## 3. Type Transformation Spec

<MathSpec>
```
# Endpoint Mapping
OLD: /api/time-capsule/{year}     -> NEW: /api/context/history/{year}
OLD: /api/future-fossils/{year}   -> NEW: /api/context/daily
NEW: /api/context/mix             (custom prompt)
NEW: /api/forge/create            (3D generation)
NEW: /api/forge/status/{id}       (poll status)
NEW: /api/forge/assets            (asset list)

# Response Transform
OLD.model_url           -> DERIVE from Forge API
OLD.events              -> NEW.events (same)
OLD.symbols             -> NEW.symbols (same)
OLD.synthesis           -> NEW.synthesis (same)
OLD.philosophy          -> NEW.philosophy (same)
NEW.suggested_prompt    -> (new field, for Forge input)
NEW.context_id          -> (new field, for tracking)

# Daily API (replaces Future Fossils)
OLD.events              -> NEW.news[]
OLD.mode                -> REMOVED
OLD.archaeologist_report -> REMOVED
NEW.keywords            -> (new field)
NEW.date                -> (replaces year for daily)
```
</MathSpec>

## 4. The Plan

<ExecutionPlan>

**Block 1: Types**
Target: `/Users/mac/Desktop/project/Sruimeng/vestige/app/types/time-capsule.ts`

1. Add Zod schemas for v5 responses
2. Define new interfaces:
   ```typescript
   // History Context (replaces TimeCapsuleData)
   interface HistoryContext {
     context_id: string
     year: number
     year_display: string
     events: HistoryEvent[]
     symbols: string[]
     synthesis: string
     philosophy: string
     suggested_prompt: string
   }

   // Daily Context (replaces FutureFossilsData)
   interface DailyContext {
     context_id: string
     date: string
     news: NewsItem[]
     philosophy: string
     suggested_prompt: string
     keywords: string[]
   }

   // Forge Types
   interface ForgeRequest {
     prompt: string
     context_id?: string
   }

   interface ForgeStatus {
     id: string
     status: 'pending' | 'processing' | 'completed' | 'failed'
     model_url?: string
     progress?: number
   }
   ```
3. Add type guards: `isHistoryContext`, `isDailyContext`
4. Keep old types for backward compat (mark deprecated)

**Block 2: API Config**
Target: `/Users/mac/Desktop/project/Sruimeng/vestige/app/constants/api.ts`

1. Add v5 base URL:
   ```typescript
   const API_V5_BASE_URL = import.meta.env.VITE_API_V5_URL || 'http://localhost:2999'
   ```
2. Add v5 endpoints:
   ```typescript
   const API_V5_ENDPOINTS = {
     HISTORY: (year: number) => `/api/context/history/${year}`,
     DAILY: '/api/context/daily',
     MIX: '/api/context/mix',
     FORGE_CREATE: '/api/forge/create',
     FORGE_STATUS: (id: string) => `/api/forge/status/${id}`,
     FORGE_ASSETS: '/api/forge/assets',
   } as const
   ```
3. Add feature flag:
   ```typescript
   const USE_API_V5 = import.meta.env.VITE_USE_API_V5 === 'true'
   ```

**Block 3: API Layer**
Target: NEW `/Users/mac/Desktop/project/Sruimeng/vestige/app/api/context.ts`

1. Create Zod schemas for validation
2. Implement fetch functions:
   ```typescript
   async function fetchHistory(year: number): Promise<HistoryContext>
   async function fetchDaily(): Promise<DailyContext>
   async function createForge(req: ForgeRequest): Promise<{ id: string }>
   async function pollForge(id: string): Promise<ForgeStatus>
   ```
3. Add adapter to convert v5 -> legacy format (backward compat)

**Block 4: Hook Migration**
Target: `/Users/mac/Desktop/project/Sruimeng/vestige/app/hooks/use-time-capsule.ts`

1. Import v5 API functions
2. Add version switch in `fetchCapsule`:
   ```typescript
   if (USE_API_V5) {
     const ctx = await fetchHistory(year)
     const forge = await createForge({ prompt: ctx.suggested_prompt, context_id: ctx.context_id })
     // poll forge until complete
     const status = await pollForgeUntilDone(forge.id)
     data = adaptToLegacy(ctx, status.model_url)
   } else {
     // existing logic
   }
   ```
3. Extract polling logic to shared util

**Block 5: Forge Polling**
Target: NEW `/Users/mac/Desktop/project/Sruimeng/vestige/app/api/forge.ts`

1. Implement `pollForgeUntilDone`:
   ```typescript
   async function pollForgeUntilDone(
     id: string,
     signal: AbortSignal,
     onProgress?: (p: number) => void
   ): Promise<ForgeStatus>
   ```
2. Use existing `POLL_INTERVAL`, `MAX_POLL_DURATION` constants

**Block 6: Adapter**
Target: NEW `/Users/mac/Desktop/project/Sruimeng/vestige/app/api/adapter.ts`

1. Convert v5 response to legacy `CapsuleData`:
   ```typescript
   function adaptHistoryToLegacy(ctx: HistoryContext, modelUrl: string): TimeCapsuleData {
     return {
       year: ctx.year,
       year_display: ctx.year_display,
       events: ctx.events,
       symbols: ctx.symbols,
       synthesis: ctx.synthesis,
       philosophy: ctx.philosophy,
       model_url: modelUrl,
       generated_at: new Date().toISOString(),
     }
   }
   ```

</ExecutionPlan>

## 5. File Manifest

| Action | File | Purpose |
|--------|------|---------|
| MODIFY | `app/types/time-capsule.ts` | Add v5 types, Zod schemas |
| MODIFY | `app/constants/api.ts` | Add v5 endpoints, feature flag |
| CREATE | `app/api/context.ts` | v5 context API functions |
| CREATE | `app/api/forge.ts` | Forge API + polling |
| CREATE | `app/api/adapter.ts` | v5 -> legacy adapter |
| MODIFY | `app/hooks/use-time-capsule.ts` | Version switch logic |

## 6. Backward Compatibility

**Strategy:** Feature flag + adapter pattern.

```
USE_API_V5=false  ->  Old API (no changes)
USE_API_V5=true   ->  v5 API + adapter -> same UI
```

UI components unchanged. Adapter converts v5 response to legacy `CapsuleData` format.

## 7. Risk Mitigation

1. **Forge async flow:** v5 separates context fetch from 3D generation. Two-step process.
2. **Daily API:** No year param. Returns today's context. May need UI adjustment for future years.
3. **Missing fields:** `archaeologist_report` removed. Check UI for usage.
4. **Model URL:** Now comes from Forge API, not context response.

## 8. Test Checklist

- [ ] History API returns valid `HistoryContext`
- [ ] Daily API returns valid `DailyContext`
- [ ] Forge create returns task ID
- [ ] Forge polling completes with model URL
- [ ] Adapter produces valid `CapsuleData`
- [ ] Feature flag switches correctly
- [ ] Existing UI renders with v5 data
