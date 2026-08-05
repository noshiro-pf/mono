# ts-data-forge

## 14.0.1

### Patch Changes

- c3cbdbd: `Arr.map`, `Arr.toFilled` and `Arr.toRangeFilled` again report the plain
  homomorphic mapping (`{ [K in keyof Ar]: B }`) for an array or tuple that
  carries no length brand, so transforming a tuple into a same-length tuple
  works inside a function that is itself generic over the tuple:

    ```ts
    const mapValues = <const T extends readonly Readonly<{ v: unknown }>[]>(
        boxes: T,
    ): Readonly<{ [K in keyof T]: unknown }> => Arr.map(boxes, (b) => b.v);
    ```

    Since v14 the return type was a conditional branching on
    `HasLengthConstraint<Ar>`, which a _generic_ `Ar` cannot decide. The
    conditional stayed deferred and its branded branch made the result
    unassignable to the caller's own mapping, so callers had to reach for a type
    assertion. Concrete tuples were unaffected and keep the same result as before.

    Brand-carrying arrays are unaffected too: they select a separate overload that
    still returns `ChangeArrayElement<Ar, …>`, so `Arr.map` on a
    `MinLengthArray<2, number>` still yields a `MinLengthArray<2, …>`.

    `Arr.toSorted`, `Arr.toSortedBy`, `Arr.toReversed`, `Arr.toUpdated`,
    `Arr.tail`, `Arr.butLast` and `Arr.zip` still do not resolve under a generic
    array parameter and are unchanged here.

## 14.0.0

### Major Changes

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

## 13.0.0

### Major Changes

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

## 12.2.2

### Patch Changes

- 8ef64f1: chore(deps): bump actions/checkout from 7.0.0 to 7.0.1
- 37cedcb: chore(deps): bump actions/setup-node from 6.4.0 to 7.0.0
- 6cb1c29: chore(deps): bump anthropics/claude-code-action from 1.0.177 to 1.0.178

## 12.2.1

### Patch Changes

- 59bfcbe: Fix how dependencies are specified.

## 12.2.0

### Minor Changes

- 36b9be2: Make toPushed/toUnshifted return types assignable to NonEmptyArray

## 12.1.0

### Minor Changes

- 1bf4200: Add curried overloads and NonEmpty specializations to length validators

## 12.0.0

### Major Changes

- db6c5f5: Rename the branded-number namespaces' `clamp` operator to `fromNumber`.

    Every branded number type (`Int16`, `Uint8`, `PositiveFiniteNumber`, …) exposed a
    one-argument `clamp(x: number)` that coerces an arbitrary `number` into the type's
    domain by saturating it into `[MIN_VALUE, MAX_VALUE]` (and rounding to the nearest
    integer, for integer types). This is a total domain projection — the counterpart of
    the `is*` guard and the throwing `as*` cast — not the usual three-argument
    `clamp(value, lo, hi)`, and the name collided with `Num.clamp` (the curried range
    clamp) and the array slice-clamp helpers. It is now named `fromNumber`, which
    matches what it does and reads correctly even for open-domain types such as
    `PositiveFiniteNumber`, where there is no natural `[lo, hi]` range.

    `Num.clamp` and the array slice-clamped utilities are unchanged.

    The `MIN_VALUE` / `MAX_VALUE` constants are unchanged; their JSDoc now clarifies that
    for open-domain types they are the nearest _representable_ in-domain value (the
    saturation target of `fromNumber`), not the mathematical bound.

    BREAKING CHANGE: replace `<Type>.clamp(x)` with `<Type>.fromNumber(x)` for every
    branded number type — e.g. `Int16.clamp(100_000)` becomes
    `Int16.fromNumber(100_000)`. `Num.clamp` is not affected.

## 11.0.1

### Patch Changes

- aec5752: Generate the remaining branded-number modules — the 6 `operatorsForFloat`
  families (`FiniteNumber`, `NonNegative`/`NonPositive`/`NonZero`/`Positive`/
  `Negative` finite numbers) and the 2 `enum` modules (`Int8`, `Uint8`) — from the
  same declarative generator that already produces the integer modules, so all 34
  branded-number modules are now generated. The generated code is structurally
  identical to the previous hand-written modules (verified by a comment-stripped
  diff), so the runtime and type surface are unchanged; only the JSDoc prose is
  templated (with per-member overrides preserving design-intent notes such as why
  `add`/`sub` are absent from `NonZeroFiniteNumber`). Worked `@example` blocks are
  still embedded from `samples/`.

    With every branded-number type now generated, the `check:branded-number-casts`
    guard is removed — consistency is enforced by generation.

- bf3466d: Generate the branded-number **integer** modules (`Int`, `Uint`, `SafeInt`, the
  `Int16/32`, `Uint16/32`, `NonNegative*`, `Positive*`, `NonZero*`, `NonPositive*`
  and `Negative*` families — 26 modules) from a declarative config
  (`scripts/gen-branded-number`) instead of maintaining them by hand. The
  generated code is structurally identical to the previous hand-written modules
  (same factory calls, `is`/`as`, namespace objects and `expectType` assertions),
  so the runtime and type surface are unchanged; only the JSDoc prose is now
  produced from flag-driven templates for consistency, with worked `@example`
  blocks still embedded from `samples/`. Generation runs as part of the build.

    The `operatorsForFloat` families and the two `enum` modules remain hand-written
    for now and continue to be covered by `check:branded-number-casts`.

## 11.0.0

### Major Changes

- 22e5322: Adopt ts-type-forge v7's brand-based `NonEmptyArray` and reorganize the length-constrained helpers so each type's helpers live in that type's namespace.

    **Breaking changes:**

    - The branded array length **guards and casts** move from top-level into the **`Arr`** namespace: `isFixedLengthArray` / `isMinLengthArray` / `isMaxLengthArray` / `isBoundedLengthArray` (and the matching `as*` casts) are now `Arr.isFixedLengthArray` / `Arr.asFixedLengthArray` / … . The structural short-`N` guards (`Arr.is*LengthTuple`) are unchanged.
    - The length-constrained **string guards** move into a new **`Str`** namespace (mirroring `Num`): `isFixedLengthString` / … are now `Str.isFixedLengthString` / … , and new `Str.as*LengthString` casts are added.
    - Array producers now return the brand-based `NonEmptyArray` (an alias of `MinLengthArray<1>`) instead of the structural non-empty tuple. Input dispatch stays structural (`NonEmptyTuple`), so plain non-empty tuples are still accepted.

    Requires `ts-type-forge@^7.0.0`.

## [10.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v9.0.1...v10.0.0) (2026-07-17)

### Features

- Add brand-based length-constrained array guards and runtime-checked casts: `Arr.is{Fixed,Min,Max,Bounded}LengthArray` and the matching `Arr.as{Fixed,Min,Max,Bounded}LengthArray` ([#421](https://github.com/noshiro-pf/ts-data-forge/issues/421)).
- Constrain the length arguments of the branded array/string guards to the shared `SupportedLength` cap (integer literals in `0..2048`); non-literal numbers and out-of-range literals are rejected at the type level.

### BREAKING CHANGES

- Rename the structural tuple guards to match the types they narrow to: `isArrayOfLength` → `isFixedLengthTuple`, `isArrayAtLeastLength` → `isMinLengthTuple`, `isArrayAtMostLength` → `isMaxLengthTuple`, `isArrayBoundedLength` → `isBoundedLengthTuple`.
- Public signatures now reference the renamed ts-type-forge tuple types (`FixedLengthTuple` etc.); requires `ts-type-forge@^6.0.0`.

## [9.0.1](https://github.com/noshiro-pf/ts-data-forge/compare/v9.0.0...v9.0.1) (2026-07-12)

### Bug Fixes

- quote absolute paths in build.mts shell command strings ([#414](https://github.com/noshiro-pf/ts-data-forge/issues/414)) ([7cabddb](https://github.com/noshiro-pf/ts-data-forge/commit/7cabddbf52674d5c4bc289fd01cd70a4bea48468))

## [9.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v8.0.0...v9.0.0) (2026-07-10)

## [8.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v7.1.1...v8.0.0) (2026-07-09)

- fix!: changed isRecord to reject arrays ([#409](https://github.com/noshiro-pf/ts-data-forge/issues/409)) ([ff73b7d](https://github.com/noshiro-pf/ts-data-forge/commit/ff73b7d2c9b5077a7a3b1e44e36430d5d5131b22))

### BREAKING CHANGES

-   - isRecord([]) now returns false (it used to return true)

isRecord was changed to allow arrays in <https://github.com/noshiro-pf/ts-data-forge/pull/222>, but the change is reverted in this commit.

## [7.1.1](https://github.com/noshiro-pf/ts-data-forge/compare/v7.1.0...v7.1.1) (2026-07-06)

### Bug Fixes

- correct type annotations for generics in some curried functions ([#404](https://github.com/noshiro-pf/ts-data-forge/issues/404)) ([cb8a79f](https://github.com/noshiro-pf/ts-data-forge/commit/cb8a79fd0b29580a25fd058ed8b9d514634d4b4f))

## [7.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v7.0.1...v7.1.0) (2026-07-04)

### Features

- add Arr.isArrayAtMostLength and Arr.isArrayBoundedLength ([#403](https://github.com/noshiro-pf/ts-data-forge/issues/403)) ([e237320](https://github.com/noshiro-pf/ts-data-forge/commit/e2373205017da129a8d718dde931c66ade9f57a5))

## [7.0.1](https://github.com/noshiro-pf/ts-data-forge/compare/v7.0.0...v7.0.1) (2026-06-29)

### Bug Fixes

- fix ISet/IMap(Mapped) type definitions to be consistent ([#402](https://github.com/noshiro-pf/ts-data-forge/issues/402)) ([095526a](https://github.com/noshiro-pf/ts-data-forge/commit/095526a32b6e29bf65f097364d53fd3db79ad992))

## [7.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.13.1...v7.0.0) (2026-06-29)

### Features

- **breaking:** Re-organize arithmetic operations to Num namespace, update ts-type-forge to v4.0.0 ([#399](https://github.com/noshiro-pf/ts-data-forge/issues/399)) ([f68a729](https://github.com/noshiro-pf/ts-data-forge/commit/f68a729211d81e23f61539008a42127fc30f5e48))

## [6.13.1](https://github.com/noshiro-pf/ts-data-forge/compare/v6.13.0...v6.13.1) (2026-06-26)

### Bug Fixes

- fix the typing of pipe function ([#398](https://github.com/noshiro-pf/ts-data-forge/issues/398)) ([657271a](https://github.com/noshiro-pf/ts-data-forge/commit/657271a8a6b4771505342c0678a799d2a904216c))

## [6.13.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.12.0...v6.13.0) (2026-06-25)

### Features

- add Num.safeParseFloat for strict number parsing ([#397](https://github.com/noshiro-pf/ts-data-forge/issues/397)) ([71cd2e4](https://github.com/noshiro-pf/ts-data-forge/commit/71cd2e41c65f419e732c1341b7fe2e71f3099c61))

## [6.12.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.11.0...v6.12.0) (2026-06-25)

### Features

- add Num.safeParseInt for strict base-10 integer parsing ([#396](https://github.com/noshiro-pf/ts-data-forge/issues/396)) ([af543ec](https://github.com/noshiro-pf/ts-data-forge/commit/af543eca5c2b23a15267aa68e82686d49584bf6f))

## [6.11.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.10.0...v6.11.0) (2026-06-22)

### Features

- Use the NonEmptyString type as the return type of isNonEmptyString ([#395](https://github.com/noshiro-pf/ts-data-forge/issues/395)) ([d2788ea](https://github.com/noshiro-pf/ts-data-forge/commit/d2788ea0bc0bbb37f0b58fa9979e624c7544629a))

## [6.10.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.9.6...v6.10.0) (2026-06-18)

### Features

- add `implies` as an alias for `ifThen` ([#392](https://github.com/noshiro-pf/ts-data-forge/issues/392)) ([09a908c](https://github.com/noshiro-pf/ts-data-forge/commit/09a908c38ea6dd22e33860c86e1355cdace707b8))

## [6.9.6](https://github.com/noshiro-pf/ts-data-forge/compare/v6.9.5...v6.9.6) (2026-05-12)

### Bug Fixes

- fix dependencies ([#375](https://github.com/noshiro-pf/ts-data-forge/issues/375)) ([f380bdd](https://github.com/noshiro-pf/ts-data-forge/commit/f380bdd117976550b56b54a9a3c537c138fc72a4))

## [6.9.5](https://github.com/noshiro-pf/ts-data-forge/compare/v6.9.4...v6.9.5) (2026-05-10)

### Bug Fixes

- fix dependencies ([#370](https://github.com/noshiro-pf/ts-data-forge/issues/370)) ([bfd1a2e](https://github.com/noshiro-pf/ts-data-forge/commit/bfd1a2eefd4d9c7ab62af6e412758212dcd889e1))

## [6.9.4](https://github.com/noshiro-pf/ts-data-forge/compare/v6.9.3...v6.9.4) (2026-05-08)

### Bug Fixes

- fix entry point ([#369](https://github.com/noshiro-pf/ts-data-forge/issues/369)) ([49e60b7](https://github.com/noshiro-pf/ts-data-forge/commit/49e60b71f00b80585f6c528005d11f92de04d13b))

## [6.9.3](https://github.com/noshiro-pf/ts-data-forge/compare/v6.9.2...v6.9.3) (2026-05-07)

### Bug Fixes

- remove src/globals.d.mts and update dependencies ([#364](https://github.com/noshiro-pf/ts-data-forge/issues/364)) ([04784f0](https://github.com/noshiro-pf/ts-data-forge/commit/04784f0ee0ff49a1d4b8ef8b142b7c2a042fdb43))

## [6.9.2](https://github.com/noshiro-pf/ts-data-forge/compare/v6.9.1...v6.9.2) (2026-04-23)

### Bug Fixes

- update deps ([#353](https://github.com/noshiro-pf/ts-data-forge/issues/353)) ([2dae401](https://github.com/noshiro-pf/ts-data-forge/commit/2dae401da3266956a7f19fc9f3191636b791915d))

## [6.9.1](https://github.com/noshiro-pf/ts-data-forge/compare/v6.9.0...v6.9.1) (2026-04-23)

### Bug Fixes

- bump @sindresorhus/is from 7.2.0 to 8.0.0 ([#348](https://github.com/noshiro-pf/ts-data-forge/issues/348)) ([4bc770c](https://github.com/noshiro-pf/ts-data-forge/commit/4bc770cbc7b56fa1e01996ebe6caf7b3f5caeed7))

## [6.9.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.8.0...v6.9.0) (2026-04-03)

### Features

- add Obj.deepPick/deepOmit ([#333](https://github.com/noshiro-pf/ts-data-forge/issues/333)) ([bdca824](https://github.com/noshiro-pf/ts-data-forge/commit/bdca824e69308a0c0d1860052412ccc0236a75d0))

## [6.8.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.7.0...v6.8.0) (2026-03-18)

### Features

- add Arr.cartesianProduct ([#325](https://github.com/noshiro-pf/ts-data-forge/issues/325)) ([7c915ea](https://github.com/noshiro-pf/ts-data-forge/commit/7c915ea08df5ce31e2d60223df2fc39500a46b16))

## [6.7.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.6.0...v6.7.0) (2026-03-17)

### Features

- improve Obj.merge typing ([#324](https://github.com/noshiro-pf/ts-data-forge/issues/324)) ([fdbbc55](https://github.com/noshiro-pf/ts-data-forge/commit/fdbbc5554cdf58b2c1c22fe6bc185322d8e22dcb))

## [6.6.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.5.0...v6.6.0) (2026-03-14)

### Features

- add Obj.merge ([#320](https://github.com/noshiro-pf/ts-data-forge/issues/320)) ([3105dc1](https://github.com/noshiro-pf/ts-data-forge/commit/3105dc166b10b143637755b607115876426864ba))

## [6.5.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.4.0...v6.5.0) (2026-02-13)

### Features

- add fastDeepEqual ([#297](https://github.com/noshiro-pf/ts-data-forge/issues/297)) ([3c1a83a](https://github.com/noshiro-pf/ts-data-forge/commit/3c1a83a139e36c79d048f3ec85f86fe45ff7c8b5))

## [6.4.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.3.1...v6.4.0) (2026-02-05)

### Features

- add better support of zero-argument functions to memoizeFunction ([#289](https://github.com/noshiro-pf/ts-data-forge/issues/289)) ([7a8c48b](https://github.com/noshiro-pf/ts-data-forge/commit/7a8c48b8b4648c2b0f7994946ca0bc1a7f3d49e3))

## [6.3.1](https://github.com/noshiro-pf/ts-data-forge/compare/v6.3.0...v6.3.1) (2026-02-03)

### Bug Fixes

- bump ts-type-forge from 2.3.0 to 2.3.1 ([#286](https://github.com/noshiro-pf/ts-data-forge/issues/286)) ([ab35432](https://github.com/noshiro-pf/ts-data-forge/commit/ab35432c67d315e29b164c27710c288ad8686606))

## [6.3.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.2.2...v6.3.0) (2026-01-23)

### Features

- add debounce function ([#273](https://github.com/noshiro-pf/ts-data-forge/issues/273)) ([f07c7e6](https://github.com/noshiro-pf/ts-data-forge/commit/f07c7e64e2fcbea537392895d4adddb7218d38d8))

## [6.2.2](https://github.com/noshiro-pf/ts-data-forge/compare/v6.2.1...v6.2.2) (2026-01-23)

### Bug Fixes

- Change node version requirements ([#271](https://github.com/noshiro-pf/ts-data-forge/issues/271)) ([7ff7993](https://github.com/noshiro-pf/ts-data-forge/commit/7ff7993870993361d2638c99306517012942c3bc))

## [6.2.1](https://github.com/noshiro-pf/ts-data-forge/compare/v6.2.0...v6.2.1) (2026-01-05)

### Bug Fixes

- bump @sindresorhus/is from 7.1.1 to 7.2.0 ([#256](https://github.com/noshiro-pf/ts-data-forge/issues/256)) ([9c5b905](https://github.com/noshiro-pf/ts-data-forge/commit/9c5b9057be9b0b3b0e474fa0219899a98a7b96c1))

## [6.2.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.1.1...v6.2.0) (2026-01-02)

### Features

- Improved handling of objects in unknownToString ([#255](https://github.com/noshiro-pf/ts-data-forge/issues/255)) ([121814b](https://github.com/noshiro-pf/ts-data-forge/commit/121814bdff20fa227aa8e82ebe4b98bd11969e1e))

## [6.1.1](https://github.com/noshiro-pf/ts-data-forge/compare/v6.1.0...v6.1.1) (2025-12-27)

### Bug Fixes

- fix Arr.sumBy document ([#251](https://github.com/noshiro-pf/ts-data-forge/issues/251)) ([47dc15f](https://github.com/noshiro-pf/ts-data-forge/commit/47dc15f2cdea301ffab52e05a921ce7e9f1f800b))

## [6.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v6.0.0...v6.1.0) (2025-12-27)

### Features

- add Arr.sumBy ([#250](https://github.com/noshiro-pf/ts-data-forge/issues/250)) ([b7b6af9](https://github.com/noshiro-pf/ts-data-forge/commit/b7b6af9aafb508bc546a5f09a31f1f80251b77e5))

## [6.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v5.1.1...v6.0.0) (2025-11-28)

### Features

- **breaking:** fix isRecord implementation ([#222](https://github.com/noshiro-pf/ts-data-forge/issues/222)) ([cb146db](https://github.com/noshiro-pf/ts-data-forge/commit/cb146db2db5daf2952c34fdda5dd6b9a8cc903bd))

### BREAKING CHANGES

- **breaking:** Changed the implementation of `isRecord` function.
  The `isRecord` function previously returned `false` for arrays, but now it returns `true` because `string[]` etc. can be assigned to `Record<string, unknown>`.

## [5.1.1](https://github.com/noshiro-pf/ts-data-forge/compare/v5.1.0...v5.1.1) (2025-11-28)

### Bug Fixes

- fix runtime dependency ([#221](https://github.com/noshiro-pf/ts-data-forge/issues/221)) ([12eda3b](https://github.com/noshiro-pf/ts-data-forge/commit/12eda3bdcba2d3605b98ab0d89b2db4713c23ffa))

## [5.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v5.0.1...v5.1.0) (2025-11-21)

### Features

- improve type implementation of Result utilities and add isMutableRecord ([#208](https://github.com/noshiro-pf/ts-data-forge/issues/208)) ([14f25ed](https://github.com/noshiro-pf/ts-data-forge/commit/14f25edb633810a9ffcffb638a05516455da13be))

## [5.0.1](https://github.com/noshiro-pf/ts-data-forge/compare/v5.0.0...v5.0.1) (2025-11-14)

### Bug Fixes

- avoid using Error.isError ([#202](https://github.com/noshiro-pf/ts-data-forge/issues/202)) ([023e222](https://github.com/noshiro-pf/ts-data-forge/commit/023e2222f42fda7d2e3f398e24ef172bd07bc8ef))

## [5.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v4.1.0...v5.0.0) (2025-11-10)

### Features

- **breaking:** fix return type of Json.stringify ([#201](https://github.com/noshiro-pf/ts-data-forge/issues/201)) ([4a92303](https://github.com/noshiro-pf/ts-data-forge/commit/4a92303ac697c9d7cf2005e80b2a57c6161f0480))

## [4.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v4.0.0...v4.1.0) (2025-11-10)

### Features

- add TernaryResult ([#200](https://github.com/noshiro-pf/ts-data-forge/issues/200)) ([eeac8fd](https://github.com/noshiro-pf/ts-data-forge/commit/eeac8fdf84082b299d29ae20e052229f6be2e36e))

## [4.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v3.3.1...v4.0.0) (2025-11-10)

### Features

- **breaking:** Defined `Optional` and `Result` types globally and re… ([#194](https://github.com/noshiro-pf/ts-data-forge/issues/194)) ([54e0ddb](https://github.com/noshiro-pf/ts-data-forge/commit/54e0ddba8ab5bb3e79f2b5c574029c1e2711a644))

## [3.3.1](https://github.com/noshiro-pf/ts-data-forge/compare/v3.3.0...v3.3.1) (2025-10-18)

### Bug Fixes

- add type checking and testing to JSDoc sample code ([#176](https://github.com/noshiro-pf/ts-data-forge/issues/176)) ([a41f6e0](https://github.com/noshiro-pf/ts-data-forge/commit/a41f6e0f344cae6c8ddefae3bab0683c6a2359ca))

## [3.3.0](https://github.com/noshiro-pf/ts-data-forge/compare/v3.2.0...v3.3.0) (2025-09-16)

### Features

- unknownToString now outputs BigInt values ​​as "123n" instead of "123" ([#149](https://github.com/noshiro-pf/ts-data-forge/issues/149)) ([1da1397](https://github.com/noshiro-pf/ts-data-forge/commit/1da139769e75fc68544531af3befa5b509688d2b))

## [3.2.0](https://github.com/noshiro-pf/ts-data-forge/compare/v3.1.0...v3.2.0) (2025-08-28)

### Features

- add Arr.generateAsync ([#128](https://github.com/noshiro-pf/ts-data-forge/issues/128)) ([cb6b2d1](https://github.com/noshiro-pf/ts-data-forge/commit/cb6b2d1babf1958456bc1a3f9cf7a8ddae1b0e27))

## [3.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v3.0.5...v3.1.0) (2025-08-12)

### Features

- update ts-type-forge ([#114](https://github.com/noshiro-pf/ts-data-forge/issues/114)) ([f208202](https://github.com/noshiro-pf/ts-data-forge/commit/f20820233b12ef2a02762b56e457694664ec7ec1))

## [3.0.5](https://github.com/noshiro-pf/ts-data-forge/compare/v3.0.4...v3.0.5) (2025-07-30)

### Bug Fixes

- fix entry point of package ([#102](https://github.com/noshiro-pf/ts-data-forge/issues/102)) ([d57908e](https://github.com/noshiro-pf/ts-data-forge/commit/d57908e4be893a0c7ccdfab842239fcabb622408))

## [3.0.4](https://github.com/noshiro-pf/ts-data-forge/compare/v3.0.3...v3.0.4) (2025-07-22)

### Bug Fixes

- fix build output ([#86](https://github.com/noshiro-pf/ts-data-forge/issues/86)) ([778efd8](https://github.com/noshiro-pf/ts-data-forge/commit/778efd8315a84fc36ac8358a9ad0f69c605c1997))

## [3.0.3](https://github.com/noshiro-pf/ts-data-forge/compare/v3.0.2...v3.0.3) (2025-07-19)

### Bug Fixes

- bump ts-type-forge from 2.1.0 to 2.1.1 ([#79](https://github.com/noshiro-pf/ts-data-forge/issues/79)) ([2c949fc](https://github.com/noshiro-pf/ts-data-forge/commit/2c949fc788524700bd50fd842c9709f7bce910c9))

## [3.0.2](https://github.com/noshiro-pf/ts-data-forge/compare/v3.0.1...v3.0.2) (2025-07-15)

### Bug Fixes

- fix genIndex settings ([#78](https://github.com/noshiro-pf/ts-data-forge/issues/78)) ([c58d370](https://github.com/noshiro-pf/ts-data-forge/commit/c58d3709d5ab36da6cfbf6ff6dfd5bb2d75cb7a1))

## [3.0.1](https://github.com/noshiro-pf/ts-data-forge/compare/v3.0.0...v3.0.1) (2025-07-15)

### Bug Fixes

- fix entry point ([#77](https://github.com/noshiro-pf/ts-data-forge/issues/77)) ([9cf49b9](https://github.com/noshiro-pf/ts-data-forge/commit/9cf49b9cf86c537d7abd107cf179d8d0f96929e9))

## [3.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v2.1.3...v3.0.0) (2025-07-15)

### Bug Fixes

- **breaking:** change unknownToString to return string instead of Result<string, Error> ([#76](https://github.com/noshiro-pf/ts-data-forge/issues/76)) ([466497f](https://github.com/noshiro-pf/ts-data-forge/commit/466497f9edf4f38d7267ea4a462467d90fedb8d7))

## [2.1.3](https://github.com/noshiro-pf/ts-data-forge/compare/v2.1.2...v2.1.3) (2025-07-15)

### Bug Fixes

- fix circular imports ([#75](https://github.com/noshiro-pf/ts-data-forge/issues/75)) ([d179eca](https://github.com/noshiro-pf/ts-data-forge/commit/d179eca10d6903f292c857f0671ff66a657d8a0d))

## [2.1.2](https://github.com/noshiro-pf/ts-data-forge/compare/v2.1.1...v2.1.2) (2025-07-15)

### Bug Fixes

- add eslint rules and fix errors ([#73](https://github.com/noshiro-pf/ts-data-forge/issues/73)) ([4c87ae0](https://github.com/noshiro-pf/ts-data-forge/commit/4c87ae0e1f67416da7eefb7019724fc145471ea2))

## [2.1.1](https://github.com/noshiro-pf/ts-data-forge/compare/v2.1.0...v2.1.1) (2025-07-15)

### Bug Fixes

- fix package.json ([#74](https://github.com/noshiro-pf/ts-data-forge/issues/74)) ([dfb261d](https://github.com/noshiro-pf/ts-data-forge/commit/dfb261dafa35449000b5af2192dbed1231044e55))

## [2.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v2.0.3...v2.1.0) (2025-07-15)

### Features

- add overload to range iterator utility ([#72](https://github.com/noshiro-pf/ts-data-forge/issues/72)) ([ebd25cf](https://github.com/noshiro-pf/ts-data-forge/commit/ebd25cf4ad097c93b90de2b9e35af35a32b1b3de))

## [2.0.3](https://github.com/noshiro-pf/ts-data-forge/compare/v2.0.2...v2.0.3) (2025-07-15)

### Bug Fixes

- add entry-point.mts ([#71](https://github.com/noshiro-pf/ts-data-forge/issues/71)) ([1ec8e53](https://github.com/noshiro-pf/ts-data-forge/commit/1ec8e53ffa1a42fe84f550628a5ac157fc2b50b6))

## [2.0.2](https://github.com/noshiro-pf/ts-data-forge/compare/v2.0.1...v2.0.2) (2025-07-09)

### Bug Fixes

- use ReadonlyRecord in the return type of Obj.fromEntries ([#64](https://github.com/noshiro-pf/ts-data-forge/issues/64)) ([2760559](https://github.com/noshiro-pf/ts-data-forge/commit/276055949ca19f554265b452c6c5057dd16897d4))

## [2.0.1](https://github.com/noshiro-pf/ts-data-forge/compare/v2.0.0...v2.0.1) (2025-07-09)

### Bug Fixes

- fix type annotation of pipe ([#63](https://github.com/noshiro-pf/ts-data-forge/issues/63)) ([1babcff](https://github.com/noshiro-pf/ts-data-forge/commit/1babcffc5820aab5df8523fb29306b9702038978))

## [2.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.5.2...v2.0.0) (2025-07-07)

### Features

- improve typing of Arr functions ([#61](https://github.com/noshiro-pf/ts-data-forge/issues/61)) ([3828c77](https://github.com/noshiro-pf/ts-data-forge/commit/3828c77e169a89e3908ffcbacfc01ce85f6f63d3))

### BREAKING CHANGES

- Tpl is removed and merged into Arr.

- The following functions have been added to `Arr`:
    - `set`
    - `findLast`
    - `findLastIndex`
    - `every`
    - `some`
    - `map`
    - `filter`
    - `flat`
    - `flatMap`
    - `toReversed`
    - `toSorted`
    - Iterators
        - `entries`
        - `values`
        - `indices`
        - `keys` (an alias for `indices`)

## [1.5.2](https://github.com/noshiro-pf/ts-data-forge/compare/v1.5.1...v1.5.2) (2025-07-05)

### Bug Fixes

- use named function style to implement function overloading ([#59](https://github.com/noshiro-pf/ts-data-forge/issues/59)) ([5df1a35](https://github.com/noshiro-pf/ts-data-forge/commit/5df1a35ecf3caf452eb9ee14cbd6ae4d843127a1))

## [1.5.1](https://github.com/noshiro-pf/ts-data-forge/compare/v1.5.0...v1.5.1) (2025-07-04)

### Bug Fixes

- reduce JSDoc examples ([#48](https://github.com/noshiro-pf/ts-data-forge/issues/48)) ([9a8b301](https://github.com/noshiro-pf/ts-data-forge/commit/9a8b3017525ee75760eb9f0e86b488688451eb57))

## [1.5.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.4.0...v1.5.0) (2025-07-04)

### Features

- use NonZeroNumber in divInt divisor ([#47](https://github.com/noshiro-pf/ts-data-forge/issues/47)) ([b1fc2db](https://github.com/noshiro-pf/ts-data-forge/commit/b1fc2db061b911d6ec94565c2af59a66a327a9ef))

## [1.4.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.3.0...v1.4.0) (2025-07-04)

### Features

- add Arr.generate ([#46](https://github.com/noshiro-pf/ts-data-forge/issues/46)) ([49b5db0](https://github.com/noshiro-pf/ts-data-forge/commit/49b5db0d22d5b295293021a3373f98fd4b4cee6f))

## [1.3.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.2.0...v1.3.0) (2025-07-04)

### Features

- add createPromise function ([#44](https://github.com/noshiro-pf/ts-data-forge/issues/44)) ([ff5bf16](https://github.com/noshiro-pf/ts-data-forge/commit/ff5bf167dbf2eba36c7bd6261b039bca5a5f4ce3))

## [1.2.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.1.0...v1.2.0) (2025-06-25)

### Features

- make range argument optional for branded numeric random function ([#33](https://github.com/noshiro-pf/ts-data-forge/issues/33)) ([7d6ce59](https://github.com/noshiro-pf/ts-data-forge/commit/7d6ce596a062916ba4ddd65d299ea2299b264dda))

## [1.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.0.2...v1.1.0) (2025-06-23)

### Features

- use string literal for object tag ([#27](https://github.com/noshiro-pf/ts-data-forge/issues/27)) ([8c6f0a6](https://github.com/noshiro-pf/ts-data-forge/commit/8c6f0a6772b5cf185f8d09633039683f2789bf06))

## [1.0.2](https://github.com/noshiro-pf/ts-data-forge/compare/v1.0.1...v1.0.2) (2025-06-22)

### Bug Fixes

- bump ts-type-forge from 2.0.2 to 2.0.3 ([#18](https://github.com/noshiro-pf/ts-data-forge/issues/18)) ([e494268](https://github.com/noshiro-pf/ts-data-forge/commit/e494268cf6bb4b1c82595afbb61bcd33bb5f132b))

### Reverts

- Revert "chore: bump @rollup/plugin-typescript from 12.1.2 to 12.1.3 ([#16](https://github.com/noshiro-pf/ts-data-forge/issues/16))" ([#23](https://github.com/noshiro-pf/ts-data-forge/issues/23)) ([ca05578](https://github.com/noshiro-pf/ts-data-forge/commit/ca055785cd9be069b6e03135dd689caae621f63a))

## [1.0.1](https://github.com/noshiro-pf/ts-data-forge/compare/v1.0.0...v1.0.1) (2025-06-22)

### Bug Fixes

- fix devDependencies ([#12](https://github.com/noshiro-pf/ts-data-forge/issues/12)) ([cc14518](https://github.com/noshiro-pf/ts-data-forge/commit/cc1451840317becbdfd11bb14c457383a1bbe3f9))
- fix release workflow ([#11](https://github.com/noshiro-pf/ts-data-forge/issues/11)) ([33fc277](https://github.com/noshiro-pf/ts-data-forge/commit/33fc277707b35cdf488386448c3060f68f8a2726))

## 1.0.0 (2025-06-15)

### Features

- initialize ts-data-forge source ([#1](https://github.com/noshiro-pf/ts-data-forge/issues/1)) ([4764a8d](https://github.com/noshiro-pf/ts-data-forge/commit/4764a8d52cd8b3cff68d4e95a493ce04fcf3ac26))
