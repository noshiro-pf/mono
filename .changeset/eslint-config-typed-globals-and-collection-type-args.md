---
'eslint-config-typed': minor
---

Add `ts-restrictions/explicit-collection-type-arguments` and
`ts-restrictions/prefer-global-this`, both `error` in
`eslintTsRestrictionsRules`; `unicorn/prefer-global-this` is now `off`.

- `explicit-collection-type-arguments` requires type arguments on `new Set`,
  `new Map`, `new WeakSet` and `new WeakMap` called with no argument or with an
  array literal. Their type arguments then come from the context or from the
  literals, and the result depends on the standard library: the stock one makes
  `new Set()` a `Set<any>`, and the strict standard library widens what it
  infers from a `ReadonlySet<'a' | 'b'>` context back to `string`. An argument
  that is any other expression (`new Set(ids)`) keeps its own element type and
  is not reported. The fix copies the type arguments of a `ReadonlySet<…>` /
  `ReadonlyMap<…>` annotation on the variable or class property the expression
  initializes.
- `prefer-global-this` runs `unicorn/prefer-global-this` and drops its report
  where `globalThis` cannot stand in for `window` / `self` / `global`: a member
  access or destructuring that reaches a name `typeof globalThis` lacks. Under
  the strict standard library a window's own globals (`history`, `document`,
  …) are declared with `const` and are not on `typeof globalThis`, so the
  upstream rule demanded a `globalThis.history` that does not type-check. With
  the stock library it reports what the upstream rule does. A
  `// eslint-disable-next-line unicorn/prefer-global-this` now has to name
  `ts-restrictions/prefer-global-this` instead.

`restrictedGlobalsForBrowser` now points the bare `location` and `navigator` at
`globalThis.location` and `globalThis.navigator`, which exist where there is no
`window`; `history` still points at `window.history`. `eslintConfigForBrowser`
no longer declares `location`, `history` and `navigator` as globals, so
`unicorn/no-unnecessary-global-this` stops rewriting `globalThis.location` back
to the bare name `no-restricted-globals` forbids; a bare reference is still
reported. Before this, only destructuring
(`const { location } = globalThis`) satisfied all three rules.

The type arguments the fix and the suggestion of
`explicit-collection-type-arguments` write come from the context first — the
annotation, the parameter, the property — and from what TypeScript infers only
when there is no context, since the inference differs between the libraries.
