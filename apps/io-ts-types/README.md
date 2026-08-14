# io-ts-types

Runtime types for dates and times, built on `ts-fortress`: `Ymdhm`,
`YearMonthDate`, `HoursMinutes`, `TimeRange`, `DatetimeRange`, `DayType`, and
the enums they are made of.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). It is
what `event-schedule-app-shared` needs, so it comes back first.

`ts-fortress` succeeds the `@noshiro/io-ts` this was written against, but not
the domain types here — those are the package. It was published as
`@noshiro/io-ts-types@1.0.0`; that version stays on npm, and this copy is
private.

## What changed on the way back

- `@noshiro/io-ts` → `ts-fortress`, `@noshiro/ts-utils` → `ts-data-forge`,
  `toSafeUint` → `asSafeUint`.
- `DateUtils` has no successor. [`src/utils`](./src/utils) carries the six
  functions this package calls. The original's `DateType` — a `Date` with its
  own getters removed, so that `DateUtils` had to be used — is not reproduced;
  the accessors take a plain `Date` and narrow what its getters return.
- `compareHm` and `compareYmdhm` compared with `Math.sign` through
  `Num.mapNaN2Undefined`. They now return `-1` or `1` directly from the
  comparison that already established the two differ, which is exact and drops
  the `NaN` case that could not arise.

```sh
pnpm run test
pnpm run type-check
```
