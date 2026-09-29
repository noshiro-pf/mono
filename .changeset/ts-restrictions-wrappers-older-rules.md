---
'eslint-config-typed': patch
---

Read through `as`, `satisfies`, `!` and `<T>` in the older `ts-restrictions`
rules, and keep the parentheses their fixes used to drop.

A type wrapper hid a pattern from these rules, or vouched for a type the
value did not have, and several fixes rebuilt an operand from its text
without the parentheses around it. Each rule now looks at the expression
underneath and keeps the wrappers in its fix:

- `ts-restrictions/prefer-nullish-coalescing-when-safe`: the left side is
  judged by the value's own type. `m.get(k)! || def` used to lose its
  `|| def` because `!` made the left side look never nullish; it now becomes
  `m.get(k)! ?? def`. `(s as 'a' | undefined) || 'x'` is left alone, since `s`
  may still be `''`. A fallback in `satisfies` and a `||=` target behind `!`
  are recognized.
- `ts-restrictions/no-unnecessary-coalesce-undefined`: `x ?? (undefined satisfies undefined)`
  is reported. `x! ?? undefined` and `(x as string) ?? undefined` are left
  alone when `x` may be `null`. `(log(), b) ?? undefined` becomes
  `(log(), b)`, not `log(), b`.
- `ts-restrictions/no-unnecessary-array-from`: `(Array.from(xs) satisfies readonly number[]).toSorted()`
  becomes `(xs satisfies readonly number[]).toSorted()`.
  `Array.from(s as unknown as readonly number[]).map(f)` on a `Set` is left
  alone, since `s.map` would throw.
- `ts-restrictions/prefer-non-mutating-array-method`: `(Array.from(xs) as number[]).sort()`
  becomes `(xs as number[]).toSorted()`, and `Array.from(xs).fill(0 satisfies number)`
  becomes `xs.map(() => 0 satisfies number)`. A `Set` cast to an array is
  left alone. `sort((log(), cmp))` keeps the parentheses of its argument.
- `ts-restrictions/prefer-curried-call`: the callee's curried signature is
  read from its value, so `(f as unknown as Curried)(a, 1)` is left alone.
  A remaining argument such as `x as number` counts as pure.
  `(a) => (c ? g : h)(a, 1)` becomes `(c ? g : h)(1)`, not `c ? g : h(1)`.
- `ts-restrictions/no-string-spread`: `[...(s as Iterable<string>)]` is
  reported when `s` is a string, as is a spread of a value cast to `string`.
- `ts-restrictions/check-destructuring-completeness`: `const { a, b } = props satisfies Props`
  (or `props!`, `props as Props`) in a component is checked against the
  props' own type, and a component whose returned JSX is wrapped
  (`(<div />) satisfies React.ReactNode`) is recognized as one.
- `ts-restrictions/no-restricted-cast-name`: a `type` fix of `x as any`
  replaces only the type, so `() => ({ a: 1 }) as any` keeps its
  parentheses. A `<any>s` rewritten as `as` is parenthesized where needed
  (`1 + (s as unknown)`), and a `function` fix keeps a comma expression's
  parentheses (`cast((log(), x))`).
- `immer-coding-style/prefer-curried-produce`: `(s) => produce(s satisfies State, recipe)`
  is reported.
- `tree-shakable/import-star`: `(ns as typeof ns).foo` and `ns!.foo` are
  member accesses, no longer reported as a use of the whole namespace.
