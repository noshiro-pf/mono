# Tests ported from synstate

Every test file of `libs/synstate` is listed here with the file that ports it,
or the reason it was not ported. A case that asked about completion asks about
`settled` or disposal here; the breaking changes behind every difference are in
[DESIGN.md](../../DESIGN.md).

## Ported

Each list is one directory of synstate, named by the files' base names.

`libs/synstate/test/cases/`: every file but `map-to` and `pluck` is in
`cases.test.mts`, `with-index` as a `scan`.

`libs/synstate/test/`:

- `authoring`: `authoring.test.mts`.
- `graph-structure`: `propagation.test.mts`.
- `take-complete`, `zip-complete`, `complete-after-last-value`, `is-observable`:
  `settled.test.mts`.
- `duplicate-copies`: `duplicate-copies.test.mts`, as a refusal.
- `eslint-config`: `eslint-config.test.mts`.

`libs/synstate/src/core/class/`:

- The type tests of `observable-base`: `authoring.test.mts`.
- `propagation-order`, `unobserved-write`, `update-loop`,
  `write-during-propagation`, the valid graphs of `circular-dependency`, and the
  `dispose` cases of `complete-propagation` and `remove-completed`:
  `propagation.test.mts`.
- The #2248 case of `complete-propagation`: `settled.test.mts`.

`libs/synstate/src/core/combine/`: `derive` is in `operators.test.mts`.

`libs/synstate/src/core/create/`:

- `counter`, `timer`, `empty`, `source`, `from-subscribable`:
  `settled.test.mts`.
- `from-promise`: `from-promise.test.mts`.

`libs/synstate/src/core/operators/`:

- `map-cut-off`, `keep-equal-parts`, `skip-while`, `take-while`,
  `with-buffered-from`, `debounce-audit-complete`, `audit-throttle-teardown`,
  `take-until-skip-until-teardown`: `operators.test.mts`.
- `flat-map-initial-value`, `flat-map-sync-inner`, `inner-ownership`:
  `flat-map.test.mts`.

`libs/synstate/src/core/scope/`: `scope` is in `owner.test.mts`.

`libs/synstate/src/utils/`: `create-state`, `create-reducer` and
`create-boolean-state` are covered by `../state-helpers.test.mts`, written with
the helpers.

## Not ported

- `map-to`, `pluck` (`libs/synstate/test/cases/`): the operators are gone; each
  is one `map`.
- `circular-dependency` (the cycles), `circular-dependency-comparison` and
  `circular-dependency-check-off`: a node's parents exist before it, so no cycle
  can be built through the API, and there is no detection to compare or turn
  off.
- `complete-propagation` and `remove-completed`, the cases about `complete()`;
  the cases of `create-*` about a completed state: completion is gone.
- `is-development-build`: synstate-next has no checks that run only in a
  development build.
