# lambda-calculus-interpreter-core

An untyped lambda calculus interpreter: a tokenizer and parser for terms
(`(lambda x. x)`, `\x. x`, `λx. x`), alpha conversion, beta reduction one step
at a time, and printing. Pure logic — the React and Preact front ends that used
to sit on top of it are still in `experimental/`.

Shortcuts the parser expands: a non-negative integer becomes its Church
numeral, `SUCC` and `PLUS` (or `+`) become the corresponding terms.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). It sat
under `packages/apps/` in the old monorepo and was never published to npm, so it
comes back to `apps/` as a private package.

## What changed on the way back

- `@noshiro/ts-utils` → `ts-data-forge`, and the types that used to be global
  (`SafeUint`, `DeepReadonly`, `LowerAlphabet`) are imported from
  `ts-type-forge`.
- `Arr.isArrayOfLength3` and its siblings are gone; [`src/utils`](./src/utils)
  has `hasLength` and `hasMinLength` in their place.
- `Arr.last` returns an `Optional` now, `toUint32`/`toSafeUint` are
  `asUint32`/`asSafeUint`, and `Num.safeParseInt` returns a `Result`.

```sh
pnpm run test
pnpm run type-check
```
