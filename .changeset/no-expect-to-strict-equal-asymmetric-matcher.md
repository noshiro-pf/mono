---
'eslint-config-typed': patch
'eslint-plugin-vitest-coding-style': patch
---

`no-expect-to-strict-equal` leaves `expect(x).toStrictEqual(y)` alone when
either side refers to Vitest's `expect`, or reads a member named `expect`, other
than to call it, as an asymmetric matcher does (`expect.any(Date)`,
`v.expect.arrayContaining([1])`, `ctx.expect.any(Date)`, a helper handed
`expect`): only `toStrictEqual` understands the matcher, and the rewrite to
`assert.deepStrictEqual` type-checked and failed. A call `expect(…)`, a property
key spelled `expect` and a binding that shadows it are still fixed.
