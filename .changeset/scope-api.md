---
'synstate': minor
---

Add a scope API for libraries built on synstate: `createScope(parent?)`, `scope.run(body)`, `scope.dispose()`, `getCurrentScope()`, `onScopeDispose(cleanup)` and `untracked(body)`. An observable created synchronously inside `scope.run` belongs to that scope, and disposing the scope disposes it without completing the shared observables it was derived from. Observables created outside every scope behave as before. `run` and `dispose` read the scope they are called on, so call them on it (`scope.dispose()`) rather than passing them on detached.
