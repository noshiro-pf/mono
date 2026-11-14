---
'synstate-preact-hooks': major
'synstate-preact-signals': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
---

Released with synstate 9, which these packages are used beside: an observable's `getSnapshot()` and `initialValue` are `Optional`s of ts-data-forge 15, unwrapped at runtime, so read them with `Optional.unwrap` instead of `.value`. The hooks themselves are unchanged, but for one consequence of `Optional.unwrapOr` no longer replacing a held `undefined` / `null`: `toSignal(observable$, fallback)` on an observable whose current value is `undefined` or `null` now starts at that value instead of `fallback`.
