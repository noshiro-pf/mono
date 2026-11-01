---
'synstate-react-hooks': patch
'synstate-react-hooks-compat': patch
'synstate-preact-hooks': patch
---

`useValueAsObservable` keeps following its value under React's StrictMode and after an `<Activity>` is hidden and shown again. In both cases React runs effect cleanups without unmounting, and the cleanup completed the hook's only observable for good.

- **Completion.** The observable now completes in a timer of 0 ms after the cleanup, so StrictMode's immediate second setup keeps the same observable. On unmount it completes in that timer too, rather than at once.
- **`<Activity>`.** An observable completed while an `<Activity>` was hidden is replaced with a new one holding the latest value, so read it from each render rather than keeping the first one.
- **Initial value.** In every package, the hook no longer pushes its initial value a second time on mount.
