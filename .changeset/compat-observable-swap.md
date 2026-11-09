---
'synstate-react-hooks-compat': patch
---

`useObservableValue` reads its observable through `use-sync-external-store/shim`, React's published `useSyncExternalStore` for React 16.8 and 17 (a new dependency), as synstate-react-hooks reads it through React's own. Passed a different observable that holds no value yet, it used to return the previous observable's value until the new one emitted; it now returns the initial value. While the observable holds no value, the initial value is the one passed on that render, where it used to be the one passed at mount. A function an observable emits is now returned as it is; it used to be called as a state updater.
