# ts-std-forge

Safe wrappers for standard library APIs that throw or return `null` / sentinel
values, returning [`Result` / `Optional`](https://github.com/noshiro-pf/mono/tree/main/libs/ts-data-forge)
instead. The dependency is strictly one-way: `ts-std-forge` → `ts-data-forge`.

The catalog of APIs to wrap, and the reasoning, live in the Tsubu language
project: [docs/tsubu/throwing-stdlib-survey.md](../../docs/tsubu/throwing-stdlib-survey.md)
(decisions D-22 / D-24).

## Current API

- `Regex.create(pattern, flags?)` — `new RegExp` without throwing (`SyntaxError` → `Err`).
- `SafeDate.toISOString(date)` — `Date.prototype.toISOString` without throwing (Invalid Date → `Err`).

Module and package names are provisional until the first npm release.
