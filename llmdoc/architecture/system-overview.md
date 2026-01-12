---
id: system-overview
type: architecture
related_ids: [doc-standard]
---

# System Overview

## Architecture Type

```typescript
type Architecture = 'SPA';
type Framework = 'React Router v7';
type RenderMode = 'CSR'; // SSR disabled
```

**Config:** `react-router.config.ts`
```typescript
{ ssr: false, routeDiscovery: { mode: 'initial' } }
```

## Route Structure

```typescript
type RouteMap = {
  '/': IndexRoute;           // Main time capsule interface
  '/:year': YearRoute;        // Direct year access (redirects to /)
  '/*': NotFoundRoute;        // 404 handler
};
```

**Flow:**
```
ROUTE /:year
  1. Parse year param (-500 to 2100)
  2. Validate range & format
  3. IF valid THEN navigate('/', { state: { initialYear } })
  4. ELSE navigate('/')

ROUTE /
  1. Read location.state.initialYear
  2. IF exists THEN setYear(initialYear)
  3. Clear state via replaceState()
```

## API Surface

### Dual API System

```typescript
interface ApiConfig {
  timeCapsule: '/api/time-capsule/:year';  // year < currentYear
  futureFossils: '/api/future-fossils/:year'; // year >= currentYear
}

FUNCTION getApiEndpoint(year: number): string
  IF year >= getCurrentYear() THEN
    RETURN '/api/future-fossils/:year'
  ELSE
    RETURN '/api/time-capsule/:year'
```

### Response Types

```typescript
// 200: Cache hit
interface SuccessResponse {
  data: CapsuleData;
}

// 202: Generating
interface GeneratingResponse {
  status: 'started' | 'generating';
  year: number;
  estimated_seconds: number;
}

// 400: Invalid year
interface ErrorResponse {
  error: 'invalid_year' | 'generation_failed';
  message: string;
}
```

### Data Types

```typescript
// Time Capsule (historical)
interface TimeCapsuleData {
  year: number;
  year_display: string;
  events: HistoryEvent[];
  symbols: string[];
  synthesis: string;
  philosophy: string;
  model_url: string;
  generated_at: string;
}

// Future Fossils (future years)
interface FutureFossilsData extends TimeCapsuleData {
  mode: 'history' | 'misread';
  events: FossilEvent[];
  archaeologist_report?: string; // Misread mode only
}

type CapsuleData = TimeCapsuleData | FutureFossilsData;
```

## Request Flow

```
USER ACTION: setYear(year)
  ↓
HOOK: useTimeCapsule.handleYearChange()
  ↓
STORE: setSystemState('SCROLLING')
  ↓
DEBOUNCE: 500ms
  ↓
STORE: setSystemState('CHECKING')
  ↓
API: fetchOnce(url)
  ├─ 200 → RETURN { type: 'success', data }
  ├─ 202 → RETURN { type: 'generating', waitSeconds }
  ├─ 400 → THROW InvalidYearError
  └─ 5xx → RETURN { type: 'retry' }
  ↓
IF type === 'success'
  STORE: setSystemState('MATERIALIZED')
  STORE: setCapsuleData(data)
ELSE IF type === 'generating'
  STORE: setSystemState('CONSTRUCTING')
  POLL: every 3s (max 5min)
    ↓
    REPEAT fetchOnce() UNTIL success OR timeout
    ↓
    STORE: setSystemState('MATERIALIZED')
ELSE IF InvalidYearError OR NetworkError
  FALLBACK: generateMockData(year)
  STORE: setSystemState('MATERIALIZED')
  STORE: setCapsuleData(mockData) // model_url = ''
```

### Polling Mechanism

```typescript
const POLL_INTERVAL = 3000;        // 3s between requests
const MAX_POLL_DURATION = 300000;  // 5min total timeout
const API_TIMEOUT = 10000;         // 10s per request

WHILE result.type !== 'success'
  1. CHECK abortController.signal
  2. CHECK elapsed < MAX_POLL_DURATION
  3. WAIT result.waitSeconds OR POLL_INTERVAL
  4. RETRY fetchOnce()
```

## State Management

### Zustand Store

```typescript
interface TimeCapsuleStore {
  currentYear: number;           // Default: 2026
  systemState: SystemState;      // Default: 'IDLE'
  capsuleData: CapsuleData | null;
  error: string | null;
  progress: number;              // 0-100 for CONSTRUCTING
}
```

### System States (6 States)

```typescript
type SystemState =
  | 'IDLE'          // Initial, awaiting input
  | 'SCROLLING'     // User rapidly changing year
  | 'CHECKING'      // Debounced, querying API
  | 'CONSTRUCTING'  // 202 received, polling for completion
  | 'MATERIALIZED'  // Data loaded, model rendered
  | 'ERROR';        // Unrecoverable error

STATE TRANSITIONS:
  IDLE → SCROLLING (user input)
  SCROLLING → CHECKING (debounce 500ms)
  CHECKING → CONSTRUCTING (202 response)
  CHECKING → MATERIALIZED (200 response)
  CONSTRUCTING → MATERIALIZED (poll success)
  * → ERROR (fatal error)
```

## Component Hierarchy

```
App
├─ BootSequence (startup animation)
└─ StyleFilterProvider (post-processing wrapper)
   └─ motion.div (main container)
      ├─ SceneCanvas (Three.js R3F)
      │  ├─ HologramWireframe (CONSTRUCTING state)
      │  ├─ ArtifactModel (MATERIALIZED + model_url)
      │  └─ PlaceholderSphere (MATERIALIZED + no model_url)
      │
      ├─ HUDOverlay (status display)
      │  ├─ CornerFrames
      │  ├─ Crosshair
      │  ├─ StatusIndicator
      │  ├─ Timestamp
      │  ├─ Coordinates
      │  ├─ SignalBar
      │  └─ FilterSelector
      │
      ├─ Chronometer (year selector)
      │  ├─ Desktop: vertical slider (right side)
      │  └─ Mobile: horizontal buttons (bottom)
      │
      ├─ LogStream (CONSTRUCTING state)
      │  └─ Progress animation + logs
      │
      ├─ PhilosophyPanel (MATERIALIZED state)
      │  └─ synthesis + philosophy + tap to expand
      │
      ├─ ArchivesSheet (drawer)
      │  ├─ Events list
      │  ├─ Symbols
      │  └─ Archaeologist report (Misread mode)
      │
      └─ ErrorPanel (ERROR state)
```

### Component State Mapping

```typescript
FUNCTION getHUDStatus(systemState: SystemState): HUDStatus
  MATCH systemState
    'IDLE' → 'INIT'
    'SCROLLING' | 'CHECKING' | 'CONSTRUCTING' → 'LOADING'
    'MATERIALIZED' → 'READY'
    'ERROR' → 'ERROR'
```

## Rendering Logic

```typescript
// Scene rendering
IF systemState === 'CONSTRUCTING'
  RENDER <HologramWireframe isAnimating />

IF systemState === 'MATERIALIZED'
  IF capsuleData.model_url !== ''
    RENDER <ArtifactModel url={model_url} />
  ELSE
    RENDER <PlaceholderSphere />

// HUD panels
IF systemState === 'CONSTRUCTING'
  RENDER <LogStream year={year} progress={progress} />

IF systemState === 'MATERIALIZED' AND capsuleData
  RENDER <PhilosophyPanel data={capsuleData} />

IF systemState === 'ERROR'
  RENDER <ErrorPanel />

IF systemState === 'IDLE'
  RENDER <HintOverlay /> // "Select a year"
```

## Constraints

### Negative Constraints

- 🚫 DO NOT use year 0 (historically invalid)
- 🚫 DO NOT allow year < -500 OR year > 2100
- 🚫 DO NOT poll beyond MAX_POLL_DURATION (5min)
- 🚫 DO NOT render ArtifactModel if model_url is empty
- 🚫 DO NOT show archaeologist_report unless mode === 'misread'
- 🚫 DO NOT use SSR (config: ssr: false)

### API Constraints

```typescript
// Year validation
YEAR_MIN = -500;
YEAR_MAX = 2100;
INVALID_YEAR = 0;

// Timeout hierarchy
API_TIMEOUT = 10s;          // Single request
POLL_INTERVAL = 3s;         // Between polls
MAX_POLL_DURATION = 5min;   // Total polling time
```

### Model URL Processing

```typescript
FUNCTION processModelUrl(url: string): string
  IF url === '' THEN RETURN ''

  url = url.replace('http:', 'https:')

  IF url.includes('tripo3d.com') THEN
    RETURN '/api/proxy-model?url=' + encodeURIComponent(url)

  RETURN url
```

## Performance Optimizations

```typescript
// Debouncing
const DEBOUNCE_DELAY = 500; // ms

// Abort previous requests
abortControllerRef.current?.abort();

// Progress simulation (CONSTRUCTING state)
INTERVAL 1s:
  progress = 5 + (elapsed / MAX_POLL_DURATION) * 90
  progress = min(progress, 95)
```

## Error Handling

```typescript
TRY
  fetchCapsule(year)
CATCH error
  IF error.name === 'AbortError'
    RETURN // User cancelled

  IF error.name === 'InvalidYearError' OR error.name === 'NetworkError'
    // Fallback to mock data
    mockData = generateMockDataForYear(year)
    mockData.model_url = '' // Triggers PlaceholderSphere
    setCapsuleData(mockData)
    setSystemState('MATERIALIZED')
  ELSE
    setSystemState('ERROR')
    setError(error.message)
```

## Related Files

- Routes: [`app/routes/_index.tsx`](../../app/routes/_index.tsx), [`app/routes/$year.tsx`](../../app/routes/$year.tsx)
- Hook: [`app/hooks/use-time-capsule.ts`](../../app/hooks/use-time-capsule.ts)
- Store: [`app/store/time-capsule.ts`](../../app/store/time-capsule.ts)
- Types: [`app/types/time-capsule.ts`](../../app/types/time-capsule.ts)
- API Config: [`app/constants/api.ts`](../../app/constants/api.ts)
- Router Config: [`react-router.config.ts`](../../react-router.config.ts)
