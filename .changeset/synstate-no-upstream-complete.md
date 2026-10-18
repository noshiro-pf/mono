---
'synstate': major
'synstate-preact-signals': major
'synstate-preact-hooks': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

Completing an observable no longer completes the observables it is derived from, and `autoComplete` is removed. A child's `complete()` no longer calls `tryComplete` on its parents: an observable completes only when it is completed itself or when all of its parents have completed. An unused upstream with a teardown (`counter`, `timer`, `debounce`, `switchMap`, …) keeps running until its owner completes or disposes it, so `counter(1000).pipe(take(3))` no longer stops the counter; complete the counter yourself once nothing needs it. `complete()` and `dispose()` now behave the same with respect to parents. `synstate-preact-signals`, `synstate-preact-hooks`, `synstate-react-hooks` and `synstate-react-hooks-compat` re-export synstate, so the change reaches their users as well.
