---
'eslint-config-typed': patch
---

`immer-coding-style/prefer-curried-produce` no longer rewrites an updater whose recipe could read the extra arguments the curried `produce` passes on. It now fixes only an arrow recipe with at most one parameter, so `xs.map((s) => produce(s, recipe))` stays as it is. It also no longer moves a patch listener into the initial-state position, and it keeps the type of an `as` around the base state as the type argument (`(s) => produce(s as State, r)` → `produce<State>(r)`).
