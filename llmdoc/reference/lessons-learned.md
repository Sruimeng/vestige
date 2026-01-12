---
id: lessons-learned
type: reference
related_ids: [style-hemingway, constitution]
---

# Lessons Learned

## 2026-01-12 Audit: Technical Debt Cleanup

- **[Memory] THREE.js Objects:** Pre-allocate `Color`, `Vector2`, `Vector3` as module-level constants. Never in default params.
- **[Naming] Impl Suffix:** Drop `*Impl` suffix. Use direct names: `BlueprintEdge` not `BlueprintEdgeEffectImpl`.
- **[Types] Any Usage:** Replace `any` with `unknown` in generic constraints.
- **[Comments] What Comments:** Delete "what" comments. Code is self-documenting.
