---
'eslint-config-typed': minor
---

Add `ts-restrictions/prefer-optional-chain-over-ternary`, which writes a
ternary that yields `undefined` for a nullish value and an access on it
otherwise as the optional chain it spells out:
`x == null ? undefined : x.b` → `x?.b`, `x != null ? x.m(1) : undefined` →
`x?.m(1)`, `x === undefined ? undefined : x[0]` → `x?.[0]`.

The check must catch every nullish value, or the chain would short-circuit
where the ternary did not. `== null` and `x === null || x === undefined`
always do. A single strict check does when the type of `x` rules out the
other value: `x === undefined` for `B | undefined`, but not for
`B | null | undefined`, `any`, or an unconstrained type parameter.
`unicorn/prefer-logical-operator-over-ternary` reports only the loose and
paired forms, and offers them as suggestions.

It leaves a ternary alone where the chain would behave differently: as a
callee or a tag (`(x?.f)()` passes `x` as `this`), and under `delete`.
