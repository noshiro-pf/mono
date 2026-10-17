---
'synstate': minor
---

Add a scope API for libraries built on synstate: `createScope(parent?)`, `scope.run(body)`, `scope.dispose()`, `getCurrentScope()`, `onScopeDispose(cleanup)` and `untracked(body)`. An observable created synchronously inside `scope.run` belongs to that scope, and disposing the scope disposes it without completing the shared observables it was derived from. Observables created outside every scope behave as before.
