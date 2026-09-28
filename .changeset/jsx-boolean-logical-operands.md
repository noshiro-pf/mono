---
'eslint-config-typed': minor
---

Require booleans on both sides of `&&` and `||` in JSX, and stop
`unicorn/prefer-logical-operator-over-ternary` from undoing it.

`ts-restrictions/jsx-boolean-logical-operands` replaces
`react/jsx-no-leaked-render`, which is turned off. It checks the operand
types: `{a && b}` and `disabled={a || b}` with two booleans pass, and
anything else is written as a ternary. `{a && <X />}` becomes
`{a ? <X /> : undefined}` as a child, and `v={a && x}` becomes
`v={a ? x : false}` as an attribute, keeping the exact value. A left
operand that is not a boolean (`{count && <X />}`, `{s || 'none'}`) is only
reported, because the comparison it stands for is the author's to write. A
ternary's branches and the operands of a longer chain count as JSX too; a
ternary's test does not.

`ts-restrictions/prefer-logical-over-boolean-ternary` now follows the same
line. In JSX it rewrites `a ? false : b` to `!a && b` only when `b` is a
boolean too, instead of never writing `&&` there at all.

`unicorn/prefer-logical-operator-over-ternary` is turned off. Since
eslint-plugin-unicorn v76 it also rewrites boolean-literal branches, with
no option to leave them out, and it turns `{a ? false : <X />}` back into
`&&` and inverts comparisons that may be `NaN`. What it covered is left to
the ts-restrictions rules above, `prefer-optional-chain-over-ternary`, and
`no-unneeded-ternary`.
