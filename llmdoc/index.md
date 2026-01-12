---
id: index
type: guide
related_ids: [constitution, style-hemingway, doc-standard]
---

# llmdoc Index

## Mandatory Reads

**Read these first. They define the rules.**

- [Constitution](./reference/constitution.md) - Graphics engine rules: matrix order, coordinate systems, shader patterns
- [Hemingway Style](./reference/style-hemingway.md) - Code style law: iceberg principle, no fluff, forbidden patterns

## Architecture

| Document | Purpose |
|----------|---------|
| [System Overview](./architecture/system-overview.md) | SPA architecture, route structure, API flow, state machine |

## Reference

| Document | Purpose |
|----------|---------|
| [Constitution](./reference/constitution.md) | WebGL/Three.js rules, matrix order, coordinate system |
| [Hemingway Style](./reference/style-hemingway.md) | Code style: terse, type-first, no meta-talk |
| [Tech Stack](./reference/tech-stack.md) | React 19, React Router v7, Vite 7, UnoCSS, Zustand |
| [Data Model](./reference/data-model.md) | Core types: TimeCapsuleData, SystemState, StyleFilter |
| [Shared Utilities](./reference/shared-utilities.md) | Hooks: useDebounce, useThrottle, useRequest |
| [Technical Debt](./reference/technical-debt.md) | Audit report: cleanup status |

## Guides

| Document | Purpose |
|----------|---------|
| [Doc Standard](./guides/doc-standard.md) | LLMDoc format: frontmatter, type-first, pseudocode |
| [PRD](./guides/prd.md) | Product spec: Time Capsule system states, user journey |
| [Design Guide](./guides/design-guide.md) | Deep Space Terminal aesthetic: colors, typography, HUD |
| [Time Capsule Guide](./guides/time-capsule-guide.md) | API usage: endpoints, polling, error handling |
| [Post-Processing PRD](./guides/prd-post-processing.md) | Style filters: blueprint, halftone, ascii, glitch |

## Agent Strategies

| Document | Purpose |
|----------|---------|
| [Blueprint Upgrade](./agent/strategy-blueprint-upgrade.md) | Strategy: engineering blueprint filter implementation |

## Quick Reference

```
Year Range: -500 to 2100
API Timeout: 10s
Poll Interval: 3s
Max Poll Duration: 5min
Coordinate System: Right-handed Y-up
Matrix Order: Column-major
```
