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

- Remove `Json.parse`'s `reviver` parameter.

    With a reviver, `JSON.parse` returns whatever the reviver returned for the
    root (a `Date`, `undefined`, ...), yet the reviver form of `parse` types it
    `JsonValue` (#2863). `Json.parseWithReviver`, which types it `unknown`, was
    added in a minor with the reviver form of `parse` deprecated; the major
    removes that form, so that `parse` is `(text) => Result<JsonValue, string>`.
    Breaks callers still passing a reviver to `parse`.

- Remove `Num.clamp`'s special case for non-finite targets.

    `Num.clamp` returns the lower bound for any target that is not finite,
    `+Infinity` included: `Num.clamp(Infinity, 0, 100)` is `0`. Without the
    `!Number.isFinite(target) ? lowerBound :` branch,
    `Math.max(lowerBound, Math.min(upperBound, target))` already clamps
    `±Infinity` to the nearer bound, so for them the branch does nothing but
    give `+Infinity` the wrong one. Removing it changes one other result:
    `Num.clamp(NaN, lo, hi)` becomes `NaN` instead of `lo`, as `Math.min` /
    `Math.max` and the `Math.clamp` proposal give. That is what makes it
    breaking; a caller relying on `lo` for `NaN` has to check `Number.isNaN`
    first. The JSDoc, which states the current behavior, changes with it.
    #4138 asks whether `±Infinity` should go to the nearer bound in a patch,
    keeping `NaN` at the lower bound; this item removes the branch altogether.
    The branded number types (`SafeInt`, `Uint32`, …) must not follow: their
    `fromNumber` sends `NaN` to `MIN_VALUE`, which #4137 moves to a clamp of
    their own. Until it has, they call `Num.clamp`, and this item waits on it.
