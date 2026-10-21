---
'eslint-config-typed': patch
---

`react-coding-style/use-memo-hook-style` now finds `useMemo`'s factory through type wrappers. It reports an `as` around the factory (`React.useMemo((() => x) as () => T, deps)`), and it no longer misses the return type or the body's assertions of a factory wrapped in `satisfies`.
