---
'synstate-preact-hooks': patch
---

Under preact 11, `useObservableEffect` no longer delivers values to a component that has unmounted, and the observable `useValueAsObservable` returns is completed as the component unmounts. preact 11 defers an effect's cleanup to after the next frame; both hooks now release what they hold from a layout effect's cleanup, which runs at once on preact 10 and 11. The `preact` peer range starts at `10.9.0`, the first version with the `useSyncExternalStore` that `useObservableValue` calls.
