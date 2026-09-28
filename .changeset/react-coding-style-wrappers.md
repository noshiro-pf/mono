---
'eslint-config-typed': patch
---

Read through `as`, `satisfies`, `!` and `<T>` in the `react-coding-style`
rules.

A type wrapper around a React call, its callee or the component passed to it
hid the component from these rules, and a wrapper around a display name made
one rule report a name that matched. Each now looks at the expression
underneath:

- The rules that look for a React call recognize one whose callee or `React`
  object is wrapped: `(React.memo as typeof React.memo)(...)`, `React.memo!(...)`,
  `(React as typeof React).memo(...)`. This alone makes
  `ban-use-imperative-handle-hook` report
  `(React.useImperativeHandle as typeof React.useImperativeHandle)(...)`.
- `props-type-annotation-style`, `react-memo-props-argument-name` and
  `react-memo-type-parameter` find the arrow function in
  `React.memo(((props) => …) satisfies React.FC<Props>)`.
  `react-memo-type-parameter` no longer asks for a type parameter when that
  wrapped function takes no props.
- `component-name` and `display-name` check `const C = React.memo(...) satisfies T;`.
- `display-name` accepts `C.displayName = 'C' as const;` and
  `'C' satisfies string`, which it reported as mismatched, and a wrapped
  component on the left, as in `(C as T).displayName = 'C'` and
  `C!.displayName = 'C'`, which it reported as missing.
- `require-react-memo` reports a component that is wrapped before it is bound
  or passed to `React.forwardRef`, as in
  `const Foo = ((props: Props) => <div />) satisfies T;` and
  `const Foo = React.forwardRef(...) as unknown as React.FC;`. A component
  wrapped inside `React.memo(...)` still counts as memoized.
- `use-memo-hook-style` reports an `as` placed after `!` or `satisfies`, as in
  `React.useMemo(...)! as T` and `React.useMemo(...) satisfies T as T`.
  `satisfies` alone is still allowed.
