---
id: shared-utilities
type: reference
related_ids: [tech-stack, data-model]
---

# Shared Utilities

Reusable hooks, utils, and factories across the codebase.

## Hooks

**Path:** `/app/hooks/`

### useDebounce

```typescript
function useDebounce<T extends (...p: any) => any>(
  fn: T,
  deps?: React.DependencyList
): DebouncedFunc<T>
```

Wraps function with 200ms debounce. Uses `lodash-es`.

### useThrottle

```typescript
function useThrottle<T extends (...p: any) => any>(
  fn: T,
  deps?: React.DependencyList
): DebouncedFunc<T>
```

Wraps function with 100ms throttle. Uses `lodash-es`.

### useLoadingRequest

```typescript
function useLoadingRequest<T extends (...p: Parameters<T>) => Promise<unknown>>(
  fn: T,
  deps?: React.DependencyList
): { request: DebouncedFunc<T>; isLoading: boolean }
```

Debounced async with loading state. Combines `useDebounce` + `useState`.

### useLoading

```typescript
function useLoading(): {
  isLoading: boolean
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}
```

Simple loading wrapper without debounce.

### useTimeCapsule

```typescript
function useTimeCapsule(): {
  // State
  year: number
  systemState: SystemState
  capsuleData: CapsuleData | null
  error: string | null
  progress: number

  // Actions
  setYear: (year: number) => void
  fetchCapsule: (year: number) => Promise<void>
  retry: () => void
  reset: () => void
}
```

**Path:** `/app/hooks/use-time-capsule.ts`

Main API orchestrator. Handles:
- Polling with progress simulation
- Auto-routing to Time Capsule or Future Fossils API
- Mock fallback on error
- Debounced year changes (500ms)
- AbortController cleanup

## Utils

**Path:** `/app/utils/utils.ts`

### sleep

```typescript
function sleep(ms: number): Promise<void>
```

Async delay.

### pf (Promise Factory)

```typescript
function pf<T>(): {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}
```

Creates promise with exposed resolve/reject. Useful for external control.

### formatFileSize

```typescript
function formatFileSize(bytes: number, decimals?: number): string
```

Returns human-readable size. Default 2 decimals. Returns empty string for 0.

### copy

```typescript
function copy(text: string): Promise<boolean>
```

Clipboard API wrapper. Returns success boolean.

### videoUrlHandler

```typescript
type VideoResult =
  | { type: 'bilibili'; bvid: string }
  | { type: 'youtube'; src: string }
  | null

function videoUrlHandler(url: string): VideoResult
```

Parses Bilibili/YouTube URLs. Rejects URLs with Chinese characters.

### isMobileDevice

```typescript
function isMobileDevice(ua: string | null): boolean
```

User-agent based mobile detection.

## Storage

**Path:** `/app/utils/storage.ts`

### User-Specific Storage

```typescript
function setStorage(key: Storage, value: unknown): void
function getStorage<T>(key: Storage): T | null
function removeStorage(key: Storage): void
```

Auto-prefixes with userId from `CommonStorage.UserDetail`.

### Global Storage

```typescript
function setCommonStorage(key: CommonStorage, value: unknown): void
function getCommonStorage<T>(key: CommonStorage): T | null
function removeCommonStorage(key: CommonStorage): void
```

No prefix. Shared across users.

## Cookie

**Path:** `/app/utils/cookie.ts`

### isInEU

```typescript
function isInEU(): boolean
```

Timezone-based EU detection via `Intl.DateTimeFormat`.

### allowCookies

```typescript
function allowCookies(): boolean
```

GDPR compliance. Returns `true` for non-EU or if consent given.

## Store Factory

**Path:** `/app/store/utils/utils.tsx`

### create

```typescript
function create<T extends Record<string, any>, U extends T>(
  name: string,
  store: Store<T, U>
): {
  Provider: React.FC<{ children: ReactNode } & Partial<T>>
  useStore: {
    (): U
    <R>(selector: (s: U) => R): R
  }
  useVanillaStore: () => StoreApi<U>
}
```

Zustand SSR wrapper with:
- Global registry via `Symbol.for(name)`
- `subscribeWithSelector` middleware
- `useShallow` for selector optimization
- Hot reload support

## API Helpers

**Path:** `/app/constants/api.ts`

### getApiEndpoint

```typescript
function getApiEndpoint(year: number): string
```

Routes to `/api/time-capsule/{year}` or `/api/future-fossils/{year}`.

### shouldUseFutureFossils

```typescript
function shouldUseFutureFossils(year: number): boolean
```

Returns `true` if `year >= getCurrentYear()`.

### processModelUrl

```typescript
function processModelUrl(url: string): string
```

- Returns fallback URL if empty
- Forces HTTPS
- Proxies `tripo3d.com` URLs for CORS

### Constants

```typescript
const API_TIMEOUT = 10000        // 10s
const POLL_INTERVAL = 3000       // 3s
const MAX_POLL_DURATION = 300000 // 5min
const MAX_RETRIES = 3
```
