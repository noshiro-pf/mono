# Next major

## Undecided

- Stop re-exporting what moved to ts-std-forge.

    `Result`, `Optional`, `TernaryResult`, `AsyncResult`, `pipe`, `match`,
    `Ok` / `Err` / `Some` / `None`, `PanicError` and its helpers,
    `unknownToString`, `hasKey` / `isRecord` / `keyIsIn` / `isNonNullObject` and
    `expectType` are implemented in ts-std-forge and only re-exported here.
    Import them from `ts-std-forge` instead. Stage 3 of D-49
    (`languages/sumi/docs/decisions.md`) drops the re-exports only if keeping
    them turns out to be a cost, after an `eslint-plugin-ts-data-forge` rule
    with an autofix has moved the imports.

- Remove the curried overloads of `Arr.count`, `Arr.countBy`, `Arr.foldl`,
  `Arr.foldr` and the like.

    Write `pipe(xs).mapWith(Arr.count, pred).value` instead of
    `pipe(xs).map(Arr.count(pred)).value`. Waits on `pipe(...).mapWith` in
    ts-std-forge, and on what becomes of eslint-config-typed's
    `ts-restrictions/prefer-curried-call` (D-58,
    `languages/sumi/docs/overload-design.md`).
