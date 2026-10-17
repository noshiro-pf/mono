---
'synstate': minor
---

Completing a derived observable no longer completes an upstream observable that releases nothing by completing. A `source`, `createState` or `just`, and anything derived from them alone, now stays alive when the last of its children completes, so a state shared by several consumers is not ended by one of them cleaning up. An observable with a teardown of its own (`counter`, `timer`, `fromAbortablePromise`, `debounce`, `throttle`, `audit`, `switchMap`, `mergeMap`), or derived from one, still completes once nothing uses it; the new `autoComplete` flag says which. Adds `dispose()`, which completes an observable and takes it out of the graph without completing any of its parents.
