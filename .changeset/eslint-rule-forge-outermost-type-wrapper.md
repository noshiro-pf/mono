---
'eslint-rule-forge': minor
---

Add `outermostTypeWrapper`, the counterpart of `skipTypeWrappers`: a node with
every `as`, `satisfies`, `!` and `<T>` that wraps it, where its value ends up.
Add `isCallee`: whether a node is what a call calls, through the type wrappers
and an optional chain around it (`f!()`, `(f as F)()`, `(o?.f)()`).
