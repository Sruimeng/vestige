---
id: tech-stack
type: reference
related_ids: [constitution, data-model]
---

# Tech Stack

## Core Framework

```typescript
interface FrameworkStack {
  runtime: 'React 19.0.0';
  router: 'React Router v7.6.2'; // SSR-capable SPA
  bundler: 'Vite 7.3.1';
  language: 'TypeScript 5.8.3';
}
```

**Architectural Decision:**
- React Router v7 provides file-based routing + SSR without full-stack framework overhead.
- Vite 7 enables fast HMR and optimized production builds.
- TypeScript strict mode enforces type safety (`strict: true`, `noUnusedLocals: true`).

## 3D Rendering

```typescript
interface ThreeDStack {
  core: 'Three.js 0.182.0';
  react_integration: '@react-three/fiber 9.5.0';
  helpers: '@react-three/drei 10.7.7';
  postprocessing: '@react-three/postprocessing 3.0.4';
}
```

**Key Configurations:**
- React Three Fiber wraps Three.js in declarative React components.
- Drei provides camera controls, loaders, and abstractions.
- Postprocessing enables shader-based visual effects (bloom, glitch, etc.).

## Styling

```typescript
interface StylingStack {
  engine: 'UnoCSS 66.2.0'; // Atomic CSS
  presets: ['presetWind3', 'presetAnimations', 'presetIcons'];
  transformers: ['transformerDirectives', 'transformerVariantGroup'];
}
```

**Configuration Highlights:**
- Atomic CSS with Tailwind-compatible syntax.
- Custom breakpoints: `xs: 375px`, `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`.
- HUD-specific shortcuts: `hud-panel`, `glass-panel`, `btn-hud`.
- Safe area insets for mobile: `safe-area-pt`, `safe-area-pb`.

## State Management

```typescript
interface StateStack {
  global: 'Zustand 5.0.3';
  forms: 'React Hook Form 7.54.2';
  validation: 'Zod 4.3.5';
  immutability: 'Immer 11.1.3';
}
```

**Pattern:**
```typescript
// Zustand store example
const useTimeCapsuleStore = create<Store>((set) => ({
  currentYear: 2026,
  setYear: (year) => set({ currentYear: year }),
}));
```

**Rationale:**
- Zustand: Minimal boilerplate, no context providers.
- Immer: Simplifies immutable updates in Zustand.
- Zod: Runtime validation for API responses.

## Internationalization

```typescript
interface I18nStack {
  core: 'i18next 25.7.3';
  react: 'react-i18next 16.5.1';
  ssr: 'remix-i18next 7.2.0';
  detection: 'i18next-browser-languagedetector 8.0.0';
  backend: 'i18next-fetch-backend 7.0.0';
}
```

**SSR Integration:**
```typescript
// Server-side i18n cookie
export const i18nCookie = createCookie('lng', {
  path: '/',
  sameSite: 'lax',
  secure: !isDEV,
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: true,
});
```

**Features:**
- Language detection via cookie + browser settings.
- SSR-compatible translation loading.
- Namespace-based resource splitting.

## Build System

```typescript
interface BuildConfig {
  dev_server: {
    host: 'localhost';
    port: 3000;
  };
  plugins: [
    'reactRouter()',
    'tsconfigPaths()',
    'envOnlyMacros()',
    'UnoCSS()'
  ];
  chunk_strategy: {
    vendor_utils: ['lodash-es', 'dayjs'];
    chunk_size_limit: 600; // KB
  };
}
```

**Optimization:**
- Manual chunking for large utility libraries.
- Path aliases via `vite-tsconfig-paths` (`@/*` → `./app/*`).
- Environment-specific macros via `vite-env-only`.

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Enforcement:**
- Strict mode catches null/undefined errors.
- Unused code detection prevents dead code.
- Verbatim module syntax ensures ESM compatibility.

## Utilities

```typescript
interface UtilityStack {
  http: 'ofetch 1.4.1'; // Fetch wrapper
  dates: 'dayjs 1.11.13';
  lodash: 'lodash-es 4.17.21'; // Tree-shakeable
  animation: 'framer-motion 12.24.12';
}
```

## Development Tools

```typescript
interface DevTools {
  linter: 'ESLint 9.23.0';
  formatter: 'Prettier 3.3.3';
  git_hooks: 'Husky 9.0.11';
  pre_commit: 'lint-staged 16.2.7';
  style_lint: 'Stylelint 16.10.0';
}
```

**Pre-commit Hook:**
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix"]
  }
}
```

## Runtime Requirements

```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.6.0"
  },
  "packageManager": "pnpm@9.6.0"
}
```

## Negative Constraints

- **DO NOT** use Create React App (deprecated).
- **DO NOT** mix CommonJS and ESM (`type: "module"` enforced).
- **DO NOT** bypass TypeScript strict checks.
- **DO NOT** use CSS-in-JS libraries (UnoCSS handles all styling).
- **DO NOT** install npm packages globally (use pnpm workspace).
