---
'eslint-config-typed': minor
---

`react-coding-style/require-react-memo` reports a component that was never
memoized.

The rest of the `react-coding-style` rules describe how a component created
with `React.memo` is written — its name, its props annotation, its
`displayName` — so a component defined as a plain function passed every one of
them, which is the case that costs the most.

A component passed to a function the rule knows nothing about (`memoNamed(...)`
and other higher order components, which may well memoize it) is left alone.
Reported are the components bound to a name directly, and those wrapped in
`React.forwardRef` alone. `ignoreName` exempts a component by name.
