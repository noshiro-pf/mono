# eslint-plugin-ts-data-forge

## 0.4.1

### Patch Changes

- Updated dependencies [c3cbdbd]
    - ts-data-forge@14.0.1

## 0.4.0

### Minor Changes

- 0dcdcbc: `prefer-is-record-and-has-key` now drops the `isRecord(...)` conjunct when the
  object already satisfies `hasKey`'s `R extends UnknownRecord` constraint, so
  `Object.hasOwn(record, key)` on a record-typed value rewrites to
  `hasKey(record, key)` instead of `isRecord(record) && hasKey(record, key)`.

    The check needs type information; without it the guard is kept, as before. It
    is deliberately conservative — a type TypeScript would accept through an
    _implicit_ index signature keeps the guard — and callables and arrays keep it
    too, because `isRecord` rejects those at runtime.

    `no-unnecessary-type-guard` recognizes `isRecord` for the same reason: it now
    reports `isRecord(x)` as always `true` when every union member already
    satisfies `UnknownRecord`, and as always `false` when none of them can (every
    primitive, array, tuple and callable).

### Patch Changes

- 938bc58: Widen the `@typescript-eslint/utils` dependency to `^8.65.0` and pin
  `ts-type-forge` to `~9.1.1`.

## 0.3.0

### Minor Changes

- 4dfe5d9: **The `Arr` and `Str` length-constrained guards and casts now take their length
  arguments first**, matching the type-parameter order of the ts-type-forge types
  they narrow to, and each `Arr` one gained a curried form.

    | before                               | after                                |
    | :----------------------------------- | :----------------------------------- |
    | `Arr.isMinLengthArray(xs, 3)`        | `Arr.isMinLengthArray(3, xs)`        |
    | `Arr.isMaxLengthArray(xs, 8)`        | `Arr.isMaxLengthArray(8, xs)`        |
    | `Arr.isFixedLengthArray(xs, 3)`      | `Arr.isFixedLengthArray(3, xs)`      |
    | `Arr.isBoundedLengthArray(xs, 1, 5)` | `Arr.isBoundedLengthArray(1, 5, xs)` |
    | `Arr.isFixedLengthTuple(xs, 2)`      | `Arr.isFixedLengthTuple(2, xs)`      |
    | `Arr.isMinLengthTuple(xs, 1)`        | `Arr.isMinLengthTuple(1, xs)`        |
    | `Arr.isMaxLengthTuple(xs, 2)`        | `Arr.isMaxLengthTuple(2, xs)`        |
    | `Arr.isBoundedLengthTuple(xs, 1, 3)` | `Arr.isBoundedLengthTuple(1, 3, xs)` |
    | `Arr.asMinLengthArray(xs, 3)`        | `Arr.asMinLengthArray(3, xs)`        |
    | `Arr.asMaxLengthArray(xs, 8)`        | `Arr.asMaxLengthArray(8, xs)`        |
    | `Arr.asFixedLengthArray(xs, 3)`      | `Arr.asFixedLengthArray(3, xs)`      |
    | `Arr.asBoundedLengthArray(xs, 1, 5)` | `Arr.asBoundedLengthArray(1, 5, xs)` |

    `Str` gets the same treatment, so the two namespaces read alike:

    | before                                | after                                 |
    | :------------------------------------ | :------------------------------------ |
    | `Str.isMinLengthString(s, 12)`        | `Str.isMinLengthString(12, s)`        |
    | `Str.isMaxLengthString(s, 32)`        | `Str.isMaxLengthString(32, s)`        |
    | `Str.isFixedLengthString(s, 2)`       | `Str.isFixedLengthString(2, s)`       |
    | `Str.isBoundedLengthString(s, 8, 16)` | `Str.isBoundedLengthString(8, 16, s)` |
    | `Str.asMinLengthString(s, 12)`        | `Str.asMinLengthString(12, s)`        |
    | `Str.asMaxLengthString(s, 32)`        | `Str.asMaxLengthString(32, s)`        |
    | `Str.asFixedLengthString(s, 2)`       | `Str.asFixedLengthString(2, s)`       |
    | `Str.asBoundedLengthString(s, 8, 16)` | `Str.asBoundedLengthString(8, 16, s)` |

    The **type** parameters follow the same order — the container (`Xs` / `S` / `E`)
    now comes after the lengths, e.g. `Arr.asMinLengthArray<Xs, MinLength>` is now
    `Arr.asMinLengthArray<MinLength, Xs>` — so an explicit type argument list reads
    in the same order as the call.

    Omitting the array or string now returns a reusable guard/cast, so the curried
    form is plain partial application of the same signature:

    ```ts
    const hasThree = Arr.isMinLengthArray(3);
    const isSmallSelection = Arr.isBoundedLengthArray(1, 5);
    const asRgb = Arr.asFixedLengthArray(3);
    ```

    The eight `Arr.is*` guards gained curried overloads; the `as*` casts in both
    namespaces already had one, and its argument order is unchanged.

    BREAKING CHANGE: every call to the twenty functions above must swap its
    arguments so the length comes first, and an explicit type argument list must
    move the container type last. The curried `as*` overloads are unaffected.

    **Length-preserving array utilities now keep the branded length constraint of
    their input.** `Arr.map` was outright broken for a length-branded input:
    `MinLengthArray<3, E>` is an intersection of a tuple and the brand object, which
    TypeScript does not treat as an array type, so the homomorphic
    `Readonly<{ [K in keyof Ar]: B }>` mapped `length`, the array methods and the
    brand keys to `B` as well and produced a non-array object. It now goes through
    ts-type-forge's `ChangeArrayElement`, which rebuilds the structural part from the
    bounds recovered from the brand and re-applies the brand:

    ```ts
    declare const history: MinLengthArray<3, number>;

    const labels = Arr.map(history, (n) => `#${n}`); // MinLengthArray<3, string>
    const first: string = labels[0]; // no `undefined`, as before the map
    ```

    `Arr.toSorted`, `Arr.toSortedBy`, `Arr.toReversed`, `Arr.set`, `Arr.toUpdated`,
    `Arr.toFilled` and `Arr.toRangeFilled` previously degraded a branded input to
    `NonEmptyArray` (or a plain array) and now keep the full constraint too.
    (`Arr.copy` already returned its input type, so it was never affected.)

    **`Arr.partition` / `Arr.chunk` now report the bounds of each chunk**, and
    `Arr.create` / `Arr.newArray` report an exact length past the tuple range:

    | call                   | before               | after                                    |
    | :--------------------- | :------------------- | :--------------------------------------- |
    | `Arr.partition(xs, 2)` | `readonly E[][]`     | `readonly BoundedLengthArray<1, 2, E>[]` |
    | `Arr.create(12, 'x')`  | `NonEmptyArray<'x'>` | `FixedLengthArray<12, 'x'>`              |

    The chunk's _lower_ bound is the point: `partition` never emits an empty chunk,
    so indexed access into one is no longer `undefined` at position `0`.

    ```ts
    const [firstChunk] = Arr.partition(values, 2);

    if (firstChunk !== undefined) {
        const first = firstChunk[0]; // not `| undefined`
    }
    ```

    BREAKING CHANGE: a chunk is now branded, so an expected value compared against
    one needs the unbranded type spelled out — `assert.deepStrictEqual<readonly (readonly number[])[]>(chunks, […])`.
    `Arr.zeros` and `Arr.seq` are deliberately unchanged: their argument type only
    carries literals up to `SmallUint`, which they already expand into an exact
    tuple, so there is no case left for a brand to describe.

    **The array operations now report the right length constraint for a
    length-constrained input**, via ts-type-forge's `ConstrainedList`.

    `Arr.set`, `Arr.toUpdated`, `Arr.tail`, `Arr.butLast`, `Arr.toReversed` and
    `Arr.zip` were annotated with `List.*`, which decides what it can say from
    whether the input is a fixed-length tuple. A length-constrained array is not one
    — its `length` is `number` — so `List` handed the input type straight back. For
    the operations that shorten an array that is not merely imprecise, it is
    **wrong**:

    ```ts
    declare const xs: MinLengthArray<5, string>;

    Arr.tail(xs);
    // before: MinLengthArray<5, string> — a 4-element result claiming at least five
    // after:  MinLengthArray<4, string>
    ```

    `Arr.set` and `Arr.toUpdated` gain positional precision from the same change:

    ```ts
    Arr.set([1, 2, 3] as const, 1, 'x');
    // before: readonly [1 | 'x', 2 | 'x', 3 | 'x']
    // after:  readonly [1, 'x', 3]
    ```

    `Arr.toReversed` also drops a hand-rolled workaround
    (`HasLengthConstraint<Ar> extends true ? ChangeArrayElement<Ar, Ar[number]> : List.Reverse<Ar>`)
    which kept the length but collapsed the element positions to their union. One
    annotation now covers plain tuples and branded arrays alike.

    A brand intersected with an exact tuple — the shape `Arr.isMinLengthArray(3, xs)`
    produces — keeps all three of the brand, the exact length and the positions.

    **A union index is handled soundly, upstream.** `ArgArrayIndex<Ar>` for a tuple
    is the union of its indices, so this is reachable from ordinary code:

    ```ts
    declare const i: 0 | 2;
    Arr.set([1, 2, 3] as const, i, 'x');
    ```

    The call replaces one position or the other and never both, so a positional
    answer of `readonly ['x', 2, 'x']` is a type that no possible result satisfies.
    The cause was upstream: `List.SetAt` walked the tuple asking `Position extends I`,
    which every member of a union answers at once, so all of them were replaced.
    ts-type-forge 9.1.1 fixes that at the source, so `Arr.set` and `Arr.toUpdated`
    pass the index straight through. Upstream widens only the positions the index can
    actually name:

    ```ts
    Arr.set([1, 2, 3] as const, i, 'x'); // i: 0 | 2
    // readonly [1 | 'x', 2, 3 | 'x'] — index 1 is not among `0 | 2`, so it stays `2`
    ```

    A single literal index keeps the exact positional answer, as before.

    **`Arr.take`, `Arr.takeLast`, `Arr.skip` and `Arr.skipLast` are sound now, but
    not more precise.** They used to hand a branded input straight back —
    `Arr.take(xs, 2)` on an "at least 5" array claimed the two-element result still
    held at least five. They now return the unconstrained `readonly E[]` for a
    branded input, and keep the exact `List.*` tuple result for a plain array or
    tuple.

    They do not yet use `ConstrainedList.Take` and friends. Against ts-type-forge
    9.1.0 they could not: those rebuilt the bounds from `N` and could not be
    instantiated against a still-generic `Ar` at all. 9.1.1 lifts that — it no
    longer distributes over `N`, so the instantiation stays bounded — which makes
    propagating the bound through these four possible as a follow-up. It is left out
    of this release because it changes their result type for branded inputs and
    deserves its own measurement.

    **`Arr.toSorted` and `Arr.toSortedBy` deliberately keep their existing
    annotation.** An arbitrary permutation may move any element anywhere, so "same
    length, element type widened to the union" stays the honest answer for them.

    **Type-parameter order now follows value-parameter order everywhere.** An audit
    comparing each type parameter's declaration position against the first value
    parameter that mentions it turned up two more signatures out of step, both
    reordered:

    | function                                    | before   | after    |
    | :------------------------------------------ | :------- | :------- |
    | `Arr.sumBy(array, mapFn)`                   | `<N, E>` | `<E, N>` |
    | `Arr.partition(array, chunkSize)` / `chunk` | `<N, E>` | `<E, N>` |

    `Arr.toUpdated`'s curried overload reorders its type parameters to `<I, E, V>`
    for the same reason.

    Deliberately left alone: `Result.fold` and `TernaryResult.fold` declare
    `<S, E, S2, E2>` / `<S, W, E, S2, W2, E2>`, grouping input types before output
    types rather than following first use — that mirrors
    `Result<S, E>` → `Result<S2, E2>` and reads better than the alternative.
    `TernaryResult<S, E, W = E>` keeps `W` last so its default can refer to `E`.

    BREAKING CHANGE: `Arr.sumBy` and `Arr.partition` (and its `Arr.chunk` alias)
    swap their two type parameters, and the curried `Arr.toUpdated` reorders its to
    `<I, E, V>`. Only call sites passing explicit type arguments are affected;
    inference is unchanged.

    **`Arr.isArray` detects `unknown` and `any` with `IsUnknown` / `IsAny`** instead
    of re-spelling them as `TypeEq<T, unknown>` / `TypeEq<T, any>`, which also drops
    the `no-explicit-any` suppression the old form needed. Behavior is unchanged.

    **The length guards and casts are regrouped, and the structural tuple family is
    completed.** `isEmpty` / `isNonEmpty` narrow to the branded types, so they now
    live with the rest of the branded guards rather than in general validation, and
    the structural `*Tuple` guards move to a file of their own:

    | module                                   | holds                                                                                         |
    | :--------------------------------------- | :-------------------------------------------------------------------------------------------- |
    | `array-utils-length-bounded-array-guard` | `isMin/Max/Bounded/FixedLengthArray`, **`isEmpty`**, **`isNonEmpty`**                         |
    | `array-utils-length-bounded-array-cast`  | `asMin/Max/Bounded/FixedLengthArray`, `asNonEmptyArray`, **`asEmptyArray`** (new)             |
    | `array-utils-length-bounded-tuple-guard` | `isMin/Max/Bounded/FixedLengthTuple`, **`isEmptyTuple`** (new), **`isNonEmptyTuple`** (new)   |
    | `array-utils-length-bounded-tuple-cast`  | **`asMin/Max/Bounded/FixedLengthTuple`**, **`asEmptyTuple`**, **`asNonEmptyTuple`** — all new |
    | `array-utils-validation`                 | `isArray`, `every`, `some`, `indexIsInRange`                                                  |

    New API:

    - `Arr.asEmptyArray(xs)` — the cast counterpart of `Arr.isEmpty`, and the
      length-0 specialization of `Arr.asFixedLengthArray`.
    - `Arr.isEmptyTuple(xs)` / `Arr.isNonEmptyTuple(xs)` — the structural
      counterparts of `isEmpty` / `isNonEmpty`, narrowing to `readonly []` and
      `MinLengthTuple<1, E>`.
    - `Arr.asFixedLengthTuple` / `asMinLengthTuple` / `asMaxLengthTuple` /
      `asBoundedLengthTuple` / `asEmptyTuple` / `asNonEmptyTuple` — the cast
      counterparts of the structural tuple guards, with the same length-first
      argument order and curried overloads as the branded family.

        These take `Xs extends readonly unknown[]` and answer
        `MinLengthTuple<N, Xs[number]> & Xs`, exactly as the branded casts answer
        `MinLengthArray<N, Xs[number]> & Xs`. Typing the parameter as `readonly E[]`
        instead would _widen_ the caller's type — an exact five-tuple would come back
        as "at least three" — which is the one thing a cast should never do, and
        which neither `Arr.as*Array` nor `Str.as*` does.

    Prefer the branded `*Array` family; the structural `*Tuple` one is there for
    when a tuple type is specifically what you need. Only the module layout moved —
    every symbol is still re-exported through `Arr`, so no import path changes for
    consumers.

    **`ts-type-forge` moves to the 9.x line.** The range goes from `~7.2.1` to
    `^9.1.1` — a caret rather than a tilde, so the consumer's tree can dedupe it
    against their own copy instead of being held to one patch line.

    It stays in `dependencies`, where it already was, and not in `peerDependencies`:
    ts-type-forge is types-only — its `exports` map has no runtime entry at all — so
    it adds nothing to a bundle, and nothing breaks if two copies end up in the tree.
    Its brands are keyed by a string literal rather than a `unique symbol`, so
    separate copies stay structurally compatible. A peer range would push a package
    the consumer never named into their install, for no benefit; `typescript` stays a
    peer dependency because that one genuinely must be shared.

    BREAKING CHANGE: the `ts-type-forge` dependency moves from `~7.2.1` to `^9.1.1`,
    for `ChangeArrayElement`, the bound accessors it is built on, and the
    `ConstrainedList` namespace. ts-type-forge types appear in ts-data-forge's own
    public signatures, so a project that also depends on `ts-type-forge` directly
    needs to be on the 9.x line. Three of its breaks are worth naming: 8.0.0
    constrains the bounds of `UintRange` / `UintRangeInclusive` to `Uint11` (ranges
    that already fit are unaffected), and 9.0.0 moves the length / index parameter
    first on `MakeTuple` and on `List.SetAt` / `Tuple.SetAt`, matching the rest of
    that library.

    **New rule `prefer-canonical-length-cast`** in `eslint-plugin-ts-data-forge`,
    the `Arr.as*` counterpart of `prefer-canonical-length-guard`:

    | ❌ written as                        | ✅ canonical form               | relation       |
    | :----------------------------------- | :------------------------------ | :------------- |
    | `Arr.asMinLengthArray(1, xs)`        | `Arr.asNonEmptyArray(xs)`       | type-identical |
    | `Arr.asBoundedLengthArray(n, n, xs)` | `Arr.asFixedLengthArray(n, xs)` | strengthens    |
    | `Arr.asMaxLengthArray(0, xs)`        | `Arr.asEmptyArray(xs)`          | strengthens    |

    A cast only ever returns the narrowed value, so strengthening the result type is
    safe — it stays assignable everywhere the old one was.
    `Arr.asBoundedLengthArray(0, n, xs)` → `Arr.asMaxLengthArray(n, xs)` is
    deliberately not reported: it would drop the `MinLengthArray<0, E>` brand, a
    widening rather than a rename.

    Both `prefer-canonical-length-*` rules now rewrite **within a family**: a branded
    `*Array` guard or cast normalizes to `isEmpty` / `isNonEmpty` / `asEmptyArray` /
    `asNonEmptyArray`, and a structural `*Tuple` one to the new `isEmptyTuple` /
    `isNonEmptyTuple` / `asEmptyTuple` / `asNonEmptyTuple`:

    | ❌ written as                        | ✅ canonical form               |
    | :----------------------------------- | :------------------------------ |
    | `Arr.isFixedLengthArray(0, xs)`      | `Arr.isEmpty(xs)`               |
    | `Arr.isFixedLengthTuple(0, xs)`      | `Arr.isEmptyTuple(xs)`          |
    | `Arr.isMinLengthTuple(1, xs)`        | `Arr.isNonEmptyTuple(xs)`       |
    | `Arr.asFixedLengthArray(0, xs)`      | `Arr.asEmptyArray(xs)`          |
    | `Arr.asFixedLengthTuple(0, xs)`      | `Arr.asEmptyTuple(xs)`          |
    | `Arr.asBoundedLengthTuple(n, n, xs)` | `Arr.asFixedLengthTuple(n, xs)` |

    Before the `*Tuple` degenerate guards existed, the only named target was the
    branded `isEmpty` / `isNonEmpty`, so rewriting a `*Tuple` guard _strengthened_
    the narrowed type by adding the brand. Sound, but it silently moved the value
    into the other family. No rewrite crosses the branded/structural divide any more;
    the few that still strengthen do so within one family, adding the structural part
    its named target already carries (e.g. `Arr.isMaxLengthArray(0, xs)` →
    `Arr.isEmpty(xs)` gains the `readonly []` that `FixedLengthArray<0, E>` includes
    and `MaxLengthArray<0, E>` does not).

    BREAKING CHANGE: `prefer-canonical-length-guard` previously rewrote
    `Arr.isFixedLengthTuple(0, xs)`, `Arr.isMaxLengthTuple(0, xs)`,
    `Arr.isBoundedLengthTuple(0, 0, xs)` and `Arr.isMinLengthTuple(1, xs)` to
    `Arr.isEmpty` / `Arr.isNonEmpty`; it now rewrites them to `Arr.isEmptyTuple` /
    `Arr.isNonEmptyTuple`. Code already autofixed by the old rule keeps compiling —
    the branded type it produced is narrower — but re-running the fixer no longer
    adds the brand, so a value that relied on it needs the branded guard spelled out.
    The new `prefer-canonical-length-cast` follows the same lanes from the start, so
    `Arr.asMaxLengthArray(0, xs)` goes to `Arr.asEmptyArray(xs)` rather than to
    `Arr.asFixedLengthArray(0, xs)`.

    The new rule is part of the `recommended` config preset, so it is enabled for
    anyone extending `eslintPluginTsDataForge.configs.recommended`.
    `prefer-canonical-length-guard` and the `xs.length <op> n` fixers it absorbed now
    emit the new length-first argument order.

    **The plugin's own `ts-type-forge` range moves with `ts-data-forge`'s.** It asked
    for `~7.2.1`, the same range `ts-data-forge` had; both go to `^9.1.1` together,
    so installing the plugin alongside the library still resolves a single copy.
    Nothing about the plugin's behavior changes: it uses ts-type-forge only for
    `DeepReadonly`, applied to `@typescript-eslint` AST nodes, and v9's change to
    that type affects arrays carrying extra keys — the length-constraint brands —
    which AST nodes do not have. Its 275 rule tests and the build pass unchanged. The
    placement was already right (`dependencies`, since `dist/types.d.mts` and
    `dist/rules/ast-utils.d.mts` import from it).

    Cost across this package's own suite: **+20.1k instantiations, about 1.0%**
    (1,946,577 against a 1,926,509 baseline).

### Patch Changes

- Updated dependencies [4dfe5d9]
    - ts-data-forge@14.0.0

## 0.2.0

### Minor Changes

- 534ac4d: **`Arr.isEmpty` and `Arr.isNonEmpty` now narrow to the branded length-constrained
  array types**, matching the rest of the `Arr` length-guard family.

    | guard                | before             | after                         |
    | :------------------- | :----------------- | :---------------------------- |
    | `Arr.isEmpty(xs)`    | `readonly []`      | `FixedLengthArray<0, E> & Xs` |
    | `Arr.isNonEmpty(xs)` | `NonEmptyArray<E>` | `MinLengthArray<1, E> & Xs`   |

    `isEmpty` was missing the brand entirely, so it was not equivalent to
    `Arr.isFixedLengthArray(xs, 0)`; `isNonEmpty` had the brand but dropped the input
    type instead of intersecting with it the way `Arr.isMinLengthArray` does. Both
    now behave exactly like their `is*LengthArray` counterparts.

    BREAKING CHANGE: the narrowed types are strictly narrower than before. Code that
    reads the narrowed value keeps compiling, but an explicit annotation such as
    `const empty: readonly [] = xs` after the guard, or passing the narrowed value
    where an unbranded array literal is expected, may now need the unbranded type
    spelled out.

    `prefer-canonical-length-guard` follows the new semantics: `isFixedLengthArray(xs, 0)`
    and `isMinLengthArray(xs, 1)` are now the _type-identical_ rewrites, and the
    structural `*Tuple` guards (`isFixedLengthTuple(xs, 0)`, `isMaxLengthTuple(xs, 0)`,
    `isBoundedLengthTuple(xs, 0, 0)`, `isMinLengthTuple(xs, 1)`) are rewritten too —
    those strengthen the narrowed type by adding the brand.

    `prefer-canonical-length-guard` additionally absorbs the five `xs.length <op> n`
    comparison rules — `prefer-arr-is-non-empty`, `prefer-arr-is-min-length-array`,
    `prefer-arr-is-max-length-array`, `prefer-arr-is-bounded-length-array` and
    `prefer-arr-is-fixed-length-array` — so one rule now covers both
    comparison → guard and guard → guard normalization.

    BREAKING CHANGE: those five rule names are removed from the plugin; enable
    `ts-data-forge/prefer-canonical-length-guard` instead. Their behavior is
    unchanged — the rule reuses their implementations rather than reimplementing
    them.

- 9dd4194: Ship a `recommended` config preset. `eslintPluginTsDataForge.configs.recommended`
  is a flat-config object that registers the plugin and enables every rule at
  `error`, so consuming projects can start from:

    ```ts
    export default [eslintPluginTsDataForge.configs.recommended];
    ```

    The preset registers the exported plugin object itself, so listing the plugin in
    your own `plugins` record alongside the preset does not trigger ESLint's
    `Cannot redefine plugin` error.

    Also exports the `ESLintFlatConfig` type alongside the existing `ESLintPlugin`.

- 534ac4d: Add the `prefer-canonical-length-guard` rule, which normalizes degenerate `Arr`
  length guards to their canonical spelling:

    - `Arr.isFixedLengthTuple(xs, 0)`, `Arr.isMaxLengthTuple(xs, 0)` and
      `Arr.isBoundedLengthTuple(xs, 0, 0)` → `Arr.isEmpty(xs)`
    - `Arr.isMinLengthArray(xs, 1)` → `Arr.isNonEmpty(xs)`

    Every rewrite narrows to exactly the same type, so the autofix is
    type-preserving.

### Patch Changes

- Updated dependencies [534ac4d]
    - ts-data-forge@13.0.0

## 0.1.7

### Patch Changes

- 8ef64f1: chore(deps): bump actions/checkout from 7.0.0 to 7.0.1
- 37cedcb: chore(deps): bump actions/setup-node from 6.4.0 to 7.0.0
- 6cb1c29: chore(deps): bump anthropics/claude-code-action from 1.0.177 to 1.0.178
- Updated dependencies [8ef64f1]
- Updated dependencies [37cedcb]
- Updated dependencies [6cb1c29]
    - ts-data-forge@12.2.2

## 0.1.6

### Patch Changes

- 59bfcbe: Fix how dependencies are specified.
- Updated dependencies [59bfcbe]
    - ts-data-forge@12.2.1

## 0.1.5

### Patch Changes

- Updated dependencies [36b9be2]
    - ts-data-forge@12.2.0

## 0.1.4

### Patch Changes

- Updated dependencies [1bf4200]
    - ts-data-forge@12.1.0

## 0.1.3

### Patch Changes

- Updated dependencies [db6c5f5]
    - ts-data-forge@12.0.0

## 0.1.2

### Patch Changes

- Updated dependencies [aec5752]
- Updated dependencies [bf3466d]
    - ts-data-forge@11.0.1

## 0.1.0

### Minor Changes

- f947b42: Initial release of `eslint-plugin-ts-data-forge`: 16 auto-fixable ESLint rules that steer TypeScript code toward `ts-data-forge` idioms (array length guards, `Arr` array helpers, branded-number casts, safe parsing, non-null-object checks, canonical array slicing, and removal of unnecessary type guards). The rules target the `ts-data-forge` v11 API and are versioned together with `ts-data-forge`.

    The package also exports typed rule-entry definitions — `EslintTsDataForgeRules` and `EslintTsDataForgeRulesOption` — mirroring `eslint-config-typed`, so consumers can type-check their rule configuration. These are auto-generated from the rule implementations (option types are derived at the type level from each rule's `TSESLint.RuleModule` signature), so they always stay in sync with the actual rules.
