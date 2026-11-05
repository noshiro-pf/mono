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

- Type `Json.parse`'s reviver form as returning `Result<unknown, string>`, and
  the reviver's `value` parameter as `unknown`.

    With a reviver, `JSON.parse` returns whatever the reviver returned for the
    root (a `Date`, `undefined`, ...), and an outer object's `value` holds what
    it already returned for the children, yet both are typed `JsonValue`
    (#2863). Give `parse` two overloads: `(text)` keeps
    `Result<JsonValue, string>`, and `(text, reviver)` returns
    `Result<unknown, string>`, its `reviver` typed
    `((this: unknown, key: string, value: unknown) => unknown) | undefined`
    so that an optional reviver can be forwarded. Breaks callers that use the
    reviver form's result as a `JsonValue` without narrowing it, reviver
    callbacks annotated `value: JsonValue`, and callers that pass `undefined` or
    forward an optional reviver, whose result becomes `unknown` even when no
    reviver is given (a wrapper annotated `Result<JsonValue, string>` stops
    compiling). The alternative is a new `Json.parseWithReviver` returning
    `Result<unknown, string>`, added in a minor with `parse`'s reviver parameter
    deprecated, so that the major only removes that parameter.
