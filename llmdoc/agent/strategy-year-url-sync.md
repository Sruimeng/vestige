---
id: strategy-year-url-sync
type: strategy
related_ids: [style-hemingway]
---

# Strategy: Year URL Sync

## 1. Analysis

**Context:**
- `$year.tsx` redirects to `/` with year in `location.state`
- Refresh loses year (state is ephemeral)
- URL should persist as `/2025` format

**Constitution:**
- Ref: `style-hemingway` - Early returns, max 3 nesting, no "what" comments
- Types ARE documentation
- Cut fluff

**Style Protocol:** Strict Adherence to `llmdoc/reference/style-hemingway.md` (Iceberg Principle, No Fluff).

**Negative Constraints:**
- No redirect in `$year.tsx`
- No `location.state` for year passing
- No duplicate rendering logic
- No verbose conditionals

## 2. Assessment

<Assessment>
**Complexity:** Level 2
</Assessment>

Rationale: URL sync is routing logic, not math/physics. No pseudo-code required, but clear execution plan needed.

## 3. The Plan

<ExecutionPlan>

**Block 1: Extract Shared Page Component**

1. Create `/app/components/time-capsule-page.tsx`
2. Move ALL rendering logic from `_index.tsx` into this component
3. Props: `{ initialYear?: number }`
4. Component handles boot sequence, HUD, scene, chronometer

**Block 2: Refactor `$year.tsx`**

1. Remove redirect logic
2. Parse year from URL params
3. Render `<TimeCapsulePage initialYear={parsedYear} />`
4. Invalid year -> render with `initialYear={undefined}` (defaults to current year)

**Block 3: Simplify `_index.tsx`**

1. Remove `location.state` handling
2. Render `<TimeCapsulePage />` (no initialYear prop)

**Block 4: URL Sync on Scroll**

1. In `use-time-capsule.ts` -> `handleYearChange`
2. After `store.setYear(year)`:
   ```
   history.replaceState(null, '', `/${year}`)
   ```
3. Shares 500ms debounce with API call (URL updates immediately, API debounced)

**Block 5: Handle Edge Cases**

1. Year 0 -> redirect to `/1`
2. Out of range -> show error state, URL unchanged
3. Initial load from `/$year` -> parse, validate, pass to component

</ExecutionPlan>

## 4. File Manifest

| File | Action | Description |
|------|--------|-------------|
| `app/components/time-capsule-page.tsx` | CREATE | Shared page component |
| `app/routes/$year.tsx` | MODIFY | Remove redirect, render shared component |
| `app/routes/_index.tsx` | MODIFY | Simplify to render shared component |
| `app/hooks/use-time-capsule.ts` | MODIFY | Add `history.replaceState` in `handleYearChange` |

## 5. Implementation Notes

**URL Update Timing:**
- URL updates IMMEDIATELY on year change (no debounce)
- API call remains debounced (500ms)
- Prevents URL lag during rapid scrolling

**Code Pattern:**
```typescript
// In handleYearChange
store.setYear(year)
history.replaceState(null, '', `/${year}`)  // immediate
// ... debounced API call follows
```

**Validation in $year.tsx:**
```typescript
const year = parseYear(params.year)
if (!year) return <TimeCapsulePage />  // fallback to default
return <TimeCapsulePage initialYear={year} />
```
