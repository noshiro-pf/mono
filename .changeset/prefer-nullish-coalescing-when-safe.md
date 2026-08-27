---
'eslint-config-typed': minor
---

Add the `ts-restrictions/prefer-nullish-coalescing-when-safe` rule (enabled as
`error`) with an auto-fixer that rewrites `||` to `??` (and `||=` to `??=`)
when the operand types prove the replacement cannot change the behavior.
Unlike `@typescript-eslint/prefer-nullish-coalescing`, which reports every
nullable `||` and offers only a suggestion because the rewrite may change
what happens on falsy non-nullish values, this rule fires exactly when that
case is impossible or unobservable, so the fix is applied by `--fix`:

- the left-hand side is nullable and has no falsy value other than
  `null` / `undefined` (an object or array type, `1 | 2 | undefined`,
  `'a' | 'b' | null`, a symbol, …) — any right-hand side qualifies; or
- the left-hand side's only possible falsy non-nullish value (`''` for
  strings, `false` for booleans, `0n` for bigints, a literal `0`) is exactly
  what the side-effect-free right-hand side evaluates to, so both operators
  produce the same value either way.

When the same falsy-case condition holds but the left-hand side can _never_
be nullish, `??` would never take its right-hand side at all, so the rule
instead removes the redundant `|| <fallback>` entirely — `<string> || ''`
becomes just the string, `<1 | 2> || 3` just the union; in the no-falsy-value
case even an effectful fallback may be dropped, because it was never
evaluated.

For `||=`, when the falsy case is reachable the target must additionally be a
plain identifier, because on a property `||=` performs an assignment where
`??=` performs none — observable through setters, `Proxy` traps, or a frozen
receiver. The fixer parenthesizes an adjacent `&&` / `||` operand where the
grammar requires it (`a && b || c` → `(a && b) ?? c`) and skips an
unparenthesized `||` nested inside another logical expression.
