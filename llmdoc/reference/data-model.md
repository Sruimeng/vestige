---
id: data-model
type: reference
title: Data Model Map
version: 1.0.0
updated: 2026-01-12
---

# Data Model Map

## Core Domain Types

### Time Capsule System

**Location:** `/Users/mac/Desktop/project/Sruimeng/vestige/app/types/time-capsule.ts`

```typescript
// Event Categories
type EventCategory = 'politics' | 'technology' | 'culture' | 'economy' | 'science';
type FossilEventCategory = EventCategory | 'ritual' | 'unknown';

// Events
interface HistoryEvent {
  title: string;
  description: string;
  category: EventCategory;
}

interface FossilEvent {
  title: string;
  description: string;
  category: FossilEventCategory;
}

// Capsule Data
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

interface FutureFossilsData {
  year: number;
  year_display: string;
  mode: FossilMode; // 'history' | 'misread'
  events: FossilEvent[];
  symbols: string[];
  synthesis: string;
  philosophy: string;
  model_url: string;
  generated_at: string;
  archaeologist_report?: string; // Misread mode only
}

type CapsuleData = TimeCapsuleData | FutureFossilsData;

// System States
type SystemState =
  | 'IDLE'          // Waiting for input
  | 'SCROLLING'     // User scrolling years
  | 'CHECKING'      // API query in progress
  | 'CONSTRUCTING'  // Generating (60s wait)
  | 'MATERIALIZED'  // Model loaded
  | 'ERROR';        // Exception

// API Responses
interface TimeCapsuleResponse {
  data: TimeCapsuleData;
}

type TimeCapsuleErrorType = 'invalid_year' | 'generation_failed';

interface TimeCapsuleErrorResponse {
  error: TimeCapsuleErrorType;
  message: string;
}

type GeneratingStatus = 'started' | 'generating';

interface TimeCapsuleGeneratingResponse {
  status: GeneratingStatus;
  year: number;
  message: string;
  estimated_seconds: number;
}
```

**Constants:**
```typescript
const YEAR_MIN = -500;
const YEAR_MAX = 2100;

const CATEGORY_LABELS: Record<EventCategory, string>;
const FOSSIL_CATEGORY_LABELS: Record<FossilEventCategory, string>;
const CATEGORY_COLORS: Record<EventCategory, string>;
const FOSSIL_CATEGORY_COLORS: Record<FossilEventCategory, string>;
```

**Type Guards:**
```typescript
function isFutureFossilsData(data: CapsuleData): data is FutureFossilsData;
function isMisreadMode(data: CapsuleData): boolean;
```

---

### Post-Processing System

**Location:** `/Users/mac/Desktop/project/Sruimeng/vestige/app/components/post-processing/types.ts`

```typescript
// Style Filters
type StyleFilter =
  | 'default'
  | 'blueprint'
  | 'halftone'
  | 'ascii'
  | 'sketch'
  | 'glitch'
  | 'crystal'
  | 'claymation'
  | 'pixel';

type FilterCategory = 'post' | 'material' | 'hybrid';
type PerformanceLevel = 1 | 2 | 3;

interface StyleFilterConfig {
  id: StyleFilter;
  label: string;
  category: FilterCategory;
  performance: PerformanceLevel;
}

// Effect Configurations
interface VignetteConfig {
  enabled: boolean;
  offset: number;
  darkness: number;
}

interface ScanlineConfig {
  enabled: boolean;
  density: number;
}

interface BloomConfig {
  enabled: boolean;
  intensity: number;
  threshold: number;
  radius: number;
}

interface ChromaticAberrationConfig {
  enabled: boolean;
  offset: [number, number];
}

interface NoiseConfig {
  enabled: boolean;
  opacity: number;
}

interface PostProcessingConfig {
  vignette: VignetteConfig;
  scanline: ScanlineConfig;
  bloom: BloomConfig;
  chromaticAberration: ChromaticAberrationConfig;
  noise: NoiseConfig;
}

// Context
interface StyleFilterContextValue {
  filter: StyleFilter;
  setFilter: (filter: StyleFilter) => void;
  config: PostProcessingConfig;
  setConfig: (config: Partial<PostProcessingConfig>) => void;
  systemState: SystemState;
  setSystemState: (state: SystemState) => void;
  isMobile: boolean;
  gpuTier: number;
}
```

**Constants:** `/Users/mac/Desktop/project/Sruimeng/vestige/app/components/post-processing/constants.ts`
```typescript
const DEFAULT_POST_PROCESSING: PostProcessingConfig;
const STYLE_FILTERS: StyleFilterConfig[];
const COLORS: {
  primary: string;
  cyan: string;
  electricBlue: string;
  neonGreen: string;
  matrixGreen: string;
  deepSpace: string;
};
```

---

## State Management

### Zustand Store

**Location:** `/Users/mac/Desktop/project/Sruimeng/vestige/app/store/time-capsule.ts`

```typescript
interface TimeCapsuleStore {
  // State
  currentYear: number;
  systemState: SystemState;
  capsuleData: CapsuleData | null;
  error: string | null;
  progress: number; // 0-100 for CONSTRUCTING state

  // Actions
  setYear: (year: number) => void;
  setSystemState: (state: SystemState) => void;
  setCapsuleData: (data: CapsuleData | null) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

const useTimeCapsuleStore = create<TimeCapsuleStore>(...);
```

**Initial State:**
```typescript
{
  currentYear: 2026,
  systemState: 'IDLE',
  capsuleData: null,
  error: null,
  progress: 0,
}
```

---

## API Configuration

**Location:** `/Users/mac/Desktop/project/Sruimeng/vestige/app/constants/api.ts`

```typescript
// Base Config
const API_BASE_URL: string;
const USE_MOCK: boolean;
const API_TIMEOUT = 10000; // 10s
const GENERATION_TIMEOUT = 90000; // 90s (deprecated)
const POLL_INTERVAL = 3000; // 3s
const MAX_POLL_DURATION = 300000; // 5min
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1s

// Endpoints
const API_ENDPOINTS = {
  TIME_CAPSULE: (year: number) => `/api/time-capsule/${year}`,
  FUTURE_FOSSILS: (year: number) => `/api/future-fossils/${year}`,
  HEALTH: '/health',
  PROXY_MODEL: '/api/proxy-model',
} as const;

// Error Codes
const ERROR_CODES = {
  INVALID_YEAR: 'invalid_year',
  GENERATION_FAILED: 'generation_failed',
  TIMEOUT: 'timeout',
  NETWORK_ERROR: 'network_error',
} as const;

const ERROR_MESSAGES: Record<string, string>;
const FALLBACK_MODEL_URL: string;

// Utilities
function getCurrentYear(): number;
function shouldUseFutureFossils(year: number): boolean;
function getApiEndpoint(year: number): string;
function processModelUrl(url: string): string;
```

---

## Generic Types

### Static Enums

**Location:** `/Users/mac/Desktop/project/Sruimeng/vestige/app/constants/static/enum.ts`

```typescript
enum Period {
  Monthly = 'monthly',
  Annually = 'annually',
}
```

### Utility Types

**Location:** `/Users/mac/Desktop/project/Sruimeng/vestige/app/constants/static/index.ts`

```typescript
type Noop = () => void;
```

---

## Store Utilities

**Location:** `/Users/mac/Desktop/project/Sruimeng/vestige/app/store/utils/utils.tsx`

Custom Zustand store factory with:
- Context-based store creation
- Hot module replacement support
- Shallow comparison via `useShallow`
- Global store registry via Symbol

```typescript
type Store<StoreState, StoreType> = (s: Partial<StoreState>) => StateCreator<StoreType>;
type Ref<T, U> = ReturnType<typeof createThisStore<T, U>>;

function create<T, U>(name: string, store: Store<T, U>): {
  Provider: React.FC<Props>;
  useStore: () => U;
  useVanillaStore: () => Ref<T, U>;
};
```

---

## Technology Stack

**Framework:** React 19 + React Router v7 (SSR)
**State:** Zustand 5
**3D:** Three.js + React Three Fiber + Drei
**Post-Processing:** @react-three/postprocessing + postprocessing
**Animation:** Framer Motion
**i18n:** i18next + react-i18next
**Validation:** Zod
**HTTP:** ofetch
**Build:** Vite 7
**Styling:** UnoCSS

---

## File Structure

```
app/
├── types/
│   ├── index.ts                    # Type exports
│   └── time-capsule.ts             # Core domain types
├── store/
│   ├── index.ts                    # Store exports
│   ├── time-capsule.ts             # Time capsule store
│   └── utils/
│       ├── index.ts
│       └── utils.tsx               # Store factory
├── constants/
│   ├── index.ts
│   ├── api.ts                      # API config
│   ├── static/
│   │   ├── index.ts
│   │   ├── enum.ts
│   │   ├── service.ts
│   │   └── storage.ts
│   └── meta/
│       ├── index.ts
│       ├── env.ts
│       └── service.ts
├── components/
│   └── post-processing/
│       ├── index.ts                # Module exports
│       ├── types.ts                # Post-processing types
│       ├── constants.ts            # Filter configs
│       ├── context.tsx             # Filter context
│       ├── composer.tsx            # Main composer
│       ├── effects/                # Post-processing effects
│       ├── materials/              # Material replacement filters
│       └── backgrounds/            # Filter-specific backgrounds
└── hooks/
    ├── index.ts
    ├── use-time-capsule.ts
    ├── debounce.ts
    ├── navigate.ts
    └── request.ts
```

---

## Data Flow

### Time Capsule Lifecycle

```
IDLE → User scrolls → SCROLLING
     ↓
SCROLLING → User stops → CHECKING
     ↓
CHECKING → Cache hit → MATERIALIZED
         → Cache miss → CONSTRUCTING
     ↓
CONSTRUCTING → Poll API (3s interval, 5min max) → MATERIALIZED
             → Timeout/Error → ERROR
     ↓
MATERIALIZED → User can view model
     ↓
ERROR → Display error message
```

### API Selection Logic

```typescript
if (year >= getCurrentYear()) {
  // Use Future Fossils API
  endpoint = `/api/future-fossils/${year}`;
} else {
  // Use Time Capsule API
  endpoint = `/api/time-capsule/${year}`;
}
```

### Model URL Processing

```typescript
// Force HTTPS
url = url.replace(/^http:/, 'https:');

// Proxy tripo3d.com URLs (CORS workaround)
if (url.includes('tripo3d.com')) {
  url = `${API_BASE_URL}/api/proxy-model?url=${encodeURIComponent(url)}`;
}
```

---

## Key Constraints

1. **Year Range:** -500 to 2100
2. **API Timeout:** 10s for normal requests
3. **Generation Timeout:** 5min max polling duration
4. **Poll Interval:** 3s between checks
5. **Retry Logic:** Max 3 retries with 1s delay
6. **Performance Levels:** 1 (low), 2 (medium), 3 (high)
7. **Filter Categories:** post (shader), material (replacement), hybrid (both)

---

## Type Safety Notes

- Use type guards (`isFutureFossilsData`, `isMisreadMode`) for discriminated unions
- `CapsuleData` is a union type requiring runtime checks
- `SystemState` is shared between time-capsule and post-processing types
- All API responses should be validated against expected interfaces
- Model URLs must be processed through `processModelUrl()` before use
