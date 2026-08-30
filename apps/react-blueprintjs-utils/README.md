# react-blueprintjs-utils

The Blueprint components `event-schedule-app` uses, wrapped: buttons, inputs,
selects, dialogs, date and time pickers, and a range slider built from scratch
on top of Blueprint's styling.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). The last
of the utilities the app needs. Never published to npm, so it lands in `apps/`
as a private package.

## Blueprint v5 → v6

The package was written against `@blueprintjs/core@5`, and v5 peer-requires
React 16.8-18. **This repository pins React 19**, so v5 cannot be installed
here and v6 is the only option — see
[experimental-inventory.md](../../docs/experimental-inventory.md).

What that migration came to:

- `DateInput3` and `DateRangeInput3` are `DateInput` and `DateRangeInput` in
  v6, and they live in `@blueprintjs/datetime` rather than `datetime2`. The
  numbered names still exist in `datetime2` as deprecated shims.
- `<Button minimal />` is `<Button variant="minimal" />`.

## What else changed

- `@noshiro/syncflow-react-hooks` → `synstate-react-hooks`, and the rest of the
  `@noshiro/*` packages to their successors here.
- `pipe(...).chain(…)` / `.chainOptional(…)` are `.map(…)` and an explicit
  `mapOptional`.
- `React.FormEvent` no longer exists in React's types; the checkbox handler
  takes the `ChangeEvent` it always received.
- `RefObject<T>` is `RefObject<T | null>` under React 19.
- `noop`, `mapOptional`, `isEmailString` and `hexToRgb` have no successor in
  `ts-data-forge`; [`src/utils`](./src/utils) carries them.

Two lint rules are scoped off, each with the reason in
[`eslint.config.mts`](./eslint.config.mts): Fast Refresh's one-export-kind rule
(this is a component library, not an application) and destructuring
completeness (these wrappers spread the rest of the props through on purpose).
