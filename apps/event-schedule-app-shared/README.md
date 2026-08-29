# event-schedule-app-shared

The types `event-schedule-app` and its server share: the event schedule itself,
answers, datetime ranges, and the enums around them — as `ts-fortress` runtime
types, so both sides validate the same shapes.

`src/v1` … `src/v9` are the schema as it stood at each version. Only `v9` is
exported from the entry point; the earlier ones are kept because stored data
still needs them to be read.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). It was
published as `@noshiro/event-schedule-app-shared@9.0.0`; that version stays on
npm, and this copy is private.

## What changed on the way back

- `@noshiro/io-ts` → `ts-fortress`, `@noshiro/ts-utils` and
  `@noshiro/ts-utils-additional` → `ts-data-forge`, `@noshiro/io-ts-types` →
  the `ts-fortress-types` restored alongside it.
- `t.stringLiteral` is `t.literal`, and the branded-type constructors take
  options rather than positional arguments.
- `NonEmptyArray` is a branded type now, so a literal one is built with
  `Arr.asNonEmptyArray` rather than written directly.
- `Obj.hasKeyValue` has no successor; [`src/utils`](./src/utils) carries it,
  because the type guards throughout this package are written in terms of it.
- `Object.hasOwn(a, 'k') ? a.k : …` became `hasKey(a, 'k') ? a.k : …`, which is
  both the repository convention and what makes the property access type-check.

```sh
pnpm run test
pnpm run type-check
```
