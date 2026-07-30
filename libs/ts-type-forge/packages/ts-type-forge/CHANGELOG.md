## [7.2.1](https://github.com/noshiro-pf/ts-type-forge/compare/v7.2.0...v7.2.1) (2026-07-21)

## 8.1.0

### Minor Changes

- 296790b: **New: the bounds of a length-constrained array type can now be read back, and
  its element type can be replaced while keeping the constraint.**

    The `*LengthArray` family encodes its bounds in a brand shaped for _subtyping_
    rather than for retrieval — `MinLengthTuple<MinLength, 0>` and
    `UintRangeInclusive<0, MaxLength>` — so a consumer had no way to get the numbers
    out, and no way to build "the same constraint with a different element type".

    | type                          | purpose                                                                  |
    | :---------------------------- | :----------------------------------------------------------------------- |
    | `MinLengthOf<Ar>`             | the minimum length the brand guarantees (`0` when it has no lower bound) |
    | `MaxLengthOf<Ar>`             | the maximum length the brand allows (`never` when it has no upper bound) |
    | `HasLengthConstraint<Ar>`     | whether `Ar` carries a length-constraint brand at all                    |
    | `LengthConstraintBrandOf<Ar>` | the brand itself, as an object type (`{}` for a plain array or tuple)    |
    | `ChangeArrayElement<Ar, Elm>` | `Ar` with its element type replaced by `Elm`, constraint kept            |

    ```ts
    type A = MinLengthOf<BoundedLengthArray<2, 5, string>>; // 2
    type B = MaxLengthOf<BoundedLengthArray<2, 5, string>>; // 5

    type C = ChangeArrayElement<MinLengthArray<3, number>, string>;
    // MinLengthArray<3, string>
    ```

    Both bounds are recovered from the brand by counting it back, so nothing extra
    is instantiated: `MinLengthOf` peels the encoded tuple's fixed prefix, and
    `MaxLengthOf` walks up from `0` testing membership of the encoded range, which
    it leaves intact (rebuilding a smaller union with `Exclude` at every step would
    make the walk quadratic in the bound). Both are one cheap step per unit of the
    bound, which keeps them well inside TypeScript's instantiation-depth limit for
    realistic bounds but makes them unsuitable for bounds in the thousands.

    `ChangeArrayElement` exists because the obvious homomorphic mapped type cannot
    do the job: a length-constrained array is an intersection of a tuple and the
    brand object, which TypeScript does not treat as an array type, so
    `Readonly<{ [K in keyof Ar]: Elm }>` maps `length`, the array methods and the
    brand keys to `Elm` as well and yields a non-array object. For a plain array or
    tuple `ChangeArrayElement` _is_ that homomorphic mapping, so tuples keep mapping
    element-wise and plain arrays stay plain arrays.

## 8.0.0

### Major Changes

- 9d48fa8: Add **`IntRange<Start, End>`** and **`IntRangeInclusive<MinValue, MaxValue>`**
  to `type-level-integer/`, the signed counterparts of `UintRange` and
  `UintRangeInclusive`: unions of integer literals that also accept negative
  bounds.

    ```ts
    type R1 = IntRange<1, 5>; // 1 | 2 | 3 | 4
    type R2 = IntRange<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2
    type R3 = IntRange<-5, -1>; // -5 | -4 | -3 | -2
    type R4 = IntRange<3, -3>; // never

    type RI1 = IntRangeInclusive<1, 5>; // 1 | 2 | 3 | 4 | 5
    type RI2 = IntRangeInclusive<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2 | 3
    type RI3 = IntRangeInclusive<-5, -1>; // -5 | -4 | -3 | -2 | -1
    type RI4 = IntRangeInclusive<3, -3>; // never
    ```

    `IntRange` is ported from `ts-fortress`, which now re-exports it from here
    instead of declaring its own copy.

    Also add **`Uint11`** (`0` to `2047`) and **`Int11`** (`-1024` to `1023`) to
    `constants/`, extending the existing `Uint8` / `Uint9` / `Uint10` and `Int8` /
    `Int9` / `Int10` family.

    **BREAKING CHANGE**: the whole integer-range family now constrains its bounds,
    matching how `Max` / `Min` already constrain theirs to `Uint10`:

    - `UintRange<Start, End>`: `extends number` / `extends number` →
      `extends Uint11` / `extends Uint11 | 2048`
    - `UintRangeInclusive<MinValue, MaxValue>`: `extends number` /
      `extends number` → `extends Uint11` / `extends Uint11`
    - `IntRange<Start, End>` (new): `extends Int11` / `extends Int11 | 1024`
    - `IntRangeInclusive<MinValue, MaxValue>` (new): `extends Int11` /
      `extends Int11`

    The exclusive-end variants accept one value above the cap (`2048` / `1024`) so
    that the full `Uint11` / `Int11` union stays expressible. A bound the union
    cannot represent — a non-integer, a negative `Uint*` bound, a non-literal
    `number`, or anything past the cap — is now a constraint error instead of
    silently resolving to `never`.

    Every range that already fit those bounds is unaffected. For a `0`-based range
    beyond the `Uint11` cap, use `IndexInclusive<N>` directly:
    `UintRangeInclusive<0, N>` and `IndexInclusive<N>` are the same type. The
    library's own `SupportedLength` (`0 | ... | 2048`, whose inclusive `2048` is one
    past `Uint11`) is now spelled that way.

### Patch Changes

- 94640c0: Define the negated condition types in terms of their positive counterparts
  instead of re-spelling the underlying trick, and `IsNever` in terms of
  `TypeExtends`:

    | type                      | before                                      | after                           |
    | :------------------------ | :------------------------------------------ | :------------------------------ |
    | `IsNotAny<T>`             | `0 extends 1 & T ? false : true`            | `BoolNot<IsAny<T>>`             |
    | `IsNotUnknown<T>`         | `IsUnknown<T> extends true ? false : true`  | `BoolNot<IsUnknown<T>>`         |
    | `IsNotFixedLengthList<T>` | `number extends T['length'] ? true : false` | `BoolNot<IsFixedLengthList<T>>` |
    | `IsNever<T>`              | `[T] extends [never] ? true : false`        | `TypeExtends<T, never>`         |

    Each `IsNot*` previously duplicated the detection logic of its positive
    counterpart, so the two could drift; they are now derived from it, which is
    also what their documentation already claimed. `IsNever` was character-for-
    character the definition of `TypeExtends<T, never>`.

    Behavior is unchanged — the existing type tests for all four cover `any`,
    `never`, `unknown`, unions, tuples and arrays.

### Performance Improvements

- collapse length-constrained brands to base type on union length parameter ([#428](https://github.com/noshiro-pf/ts-type-forge/issues/428)) ([f34256e](https://github.com/noshiro-pf/ts-type-forge/commit/f34256ed3d74edaedb1dc662e1f69e7388d5de60))

# [7.2.0](https://github.com/noshiro-pf/ts-type-forge/compare/v7.1.0...v7.2.0) (2026-07-21)

### Features

- Add NonPositiveInt16, NonPositiveInt32 and WithSmallInt variants; ([#427](https://github.com/noshiro-pf/ts-type-forge/issues/427)) ([6a3024b](https://github.com/noshiro-pf/ts-type-forge/commit/6a3024bfc5a1b6ec1ca09fb2e7878e0d8ae36321))

# [7.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v7.0.0...v7.1.0) (2026-07-20)

### Features

- add IsAny/IsUnknown, fix general-array tuple ops, hide internal… ([#425](https://github.com/noshiro-pf/ts-type-forge/issues/425)) ([5d91fe2](https://github.com/noshiro-pf/ts-type-forge/commit/5d91fe2c7faf2784caacb9e93628bcdc540fb90b))

# [7.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v6.1.0...v7.0.0) (2026-07-18)

### Features

- Add `Mutable{Max,Bounded,Fixed}LengthArray`, completing the mutable branded counterparts of the readonly length-constrained array family so every readonly variant has a matching mutable one ([#417](https://github.com/noshiro-pf/ts-type-forge/issues/417)).

### BREAKING CHANGES

- `NonEmptyArray` / `MutableNonEmptyArray` are now brand-based (`MinLengthArray<1>` / `MutableMinLengthArray<1>`); a plain array literal is no longer directly assignable to them. Use `NonEmptyTuple` / `MutableNonEmptyTuple` for the previous structural types.

# [6.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v6.0.0...v6.1.0) (2026-07-18)

### Features

- add Float16 type ([#416](https://github.com/noshiro-pf/ts-type-forge/issues/416)) ([d7c4634](https://github.com/noshiro-pf/ts-type-forge/commit/d7c4634bbb1f2ea0658e34369c91ec284bb41e49))

# [6.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v5.0.0...v6.0.0) (2026-07-17)

### Features

- Add brand-based length-constrained array types (`MaxLengthArray` / `MinLengthArray` / `BoundedLengthArray` / `FixedLengthArray`), with a structural tuple prefix for small lengths ([#415](https://github.com/noshiro-pf/ts-type-forge/issues/415)).
- Cap the length parameters of the branded array/string families at a shared `SupportedLength` (`0..2048`), and export the shared boundaries `SupportedLengthCap`, `SupportedLength`, `StructuralPrefixCap`, and `StructuralPrefixLength` for downstream reuse.

### BREAKING CHANGES

- Rename the structural tuple family `ArrayOfLength` / `ArrayAtLeastLen` / `ArrayAtMostLen` / `ArrayBoundedLen` (and their `Mutable*` variants) to `FixedLengthTuple` / `MinLengthTuple` / `MaxLengthTuple` / `BoundedLengthTuple` (and `Mutable*`); the old names are no longer exported.
- The length parameters of the branded string types (`MaxLengthString` etc.) are now constrained to `SupportedLength` (`0..2048`); larger literals and non-literal `number` are rejected. `SupportedArrayLength` is renamed to `SupportedLength`.

# [5.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v4.0.0...v5.0.0) (2026-07-09)

- feat!: add length-constrained branded string types and redefine NonEmptyString ([#406](https://github.com/noshiro-pf/ts-type-forge/issues/406)) ([0cbec25](https://github.com/noshiro-pf/ts-type-forge/commit/0cbec25b25dda25162db26046b73d304eb3dd418))

### BREAKING CHANGES

- `NonEmptyString` no longer carries the `'NonEmptyString'`
  brand key. It is now `Brand`-compatible with `MinLengthString<1>` instead
  of a standalone `Brand<string, 'NonEmptyString'>`. Values that were cast to
  `NonEmptyString` via the old brand key, or code that inspected the brand
  keys (e.g. `UnwrapBrandTrueKeys`), will observe a different brand shape.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: <https://claude.ai/code/session_01VfbfUoEnhGNsnmmbb8w9TB>

- refactor: re-organize src files

# [4.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v3.2.0...v4.0.0) (2026-06-27)

### Features

- **breaking:** add NonPositiveNumber ([#398](https://github.com/noshiro-pf/ts-type-forge/issues/398)) ([973217d](https://github.com/noshiro-pf/ts-type-forge/commit/973217da2f50d944132ed8a0bbdc9bacefeeb3cd))

# [3.2.0](https://github.com/noshiro-pf/ts-type-forge/compare/v3.1.0...v3.2.0) (2026-06-22)

### Features

- add NonEmptyString ([#396](https://github.com/noshiro-pf/ts-type-forge/issues/396)) ([bf4f73b](https://github.com/noshiro-pf/ts-type-forge/commit/bf4f73bda255048e36fcd8dfd954fe9b1be7db9c))

# [3.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v3.0.1...v3.1.0) (2026-06-01)

### Features

- add ArrayBoundedLen and ArrayAtMostLen type ([#379](https://github.com/noshiro-pf/ts-type-forge/issues/379)) ([ac5bebc](https://github.com/noshiro-pf/ts-type-forge/commit/ac5bebc5f3c3b6230eae0e5cce371a0f48694040))

## [3.0.1](https://github.com/noshiro-pf/ts-type-forge/compare/v3.0.0...v3.0.1) (2026-05-10)

### Bug Fixes

- fix dependencies ([#367](https://github.com/noshiro-pf/ts-type-forge/issues/367)) ([3375b5f](https://github.com/noshiro-pf/ts-type-forge/commit/3375b5f045aae2eac9f0339ab326971199bf28d2))

# [3.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.4.2...v3.0.0) (2026-05-06)

- feat!: ship as side-effect-free named-export library ([#365](https://github.com/noshiro-pf/ts-type-forge/issues/365)) ([f831899](https://github.com/noshiro-pf/ts-type-forge/commit/f8318991603348d016514c950606ce509214b6bb)), closes [#364](https://github.com/noshiro-pf/ts-type-forge/issues/364)

### BREAKING CHANGES

- ts-type-forge no longer exposes its types as ambient
  globals by default. Consumers that relied on
  `/// <reference types="ts-type-forge" />` to get every type globally
  must switch to `/// <reference types="ts-type-forge/global" />`, or
  move to explicit named imports. The `TSTypeForgeInternals` namespace
  has been flattened into `TSTypeForgeInternals_*` named exports. The
  package now ships `dist/` instead of `src/`.

## [2.4.2](https://github.com/noshiro-pf/ts-type-forge/compare/v2.4.1...v2.4.2) (2026-05-06)

### Bug Fixes

- update dependencies and import ts-type-forge explicitly ([#364](https://github.com/noshiro-pf/ts-type-forge/issues/364)) ([11f2310](https://github.com/noshiro-pf/ts-type-forge/commit/11f2310bc6fda2d7fe3129cd43a688863bfce6f6))

## [2.4.1](https://github.com/noshiro-pf/ts-type-forge/compare/v2.4.0...v2.4.1) (2026-04-23)

### Bug Fixes

- update deps ([#353](https://github.com/noshiro-pf/ts-type-forge/issues/353)) ([3201863](https://github.com/noshiro-pf/ts-type-forge/commit/3201863ad9565ee9e51457efb1714dd9ed79c191))

# [2.4.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.3.1...v2.4.0) (2026-04-03)

### Features

- add DeepPick, DeepOmit ([#332](https://github.com/noshiro-pf/ts-type-forge/issues/332)) ([5749976](https://github.com/noshiro-pf/ts-type-forge/commit/57499765aadffa4ebf56840d55536d9ab68fcf0a))

## [2.3.1](https://github.com/noshiro-pf/ts-type-forge/compare/v2.3.0...v2.3.1) (2026-01-23)

### Bug Fixes

- Change node version requirements ([#264](https://github.com/noshiro-pf/ts-type-forge/issues/264)) ([f8f88b9](https://github.com/noshiro-pf/ts-type-forge/commit/f8f88b906f01a30ce4ce79a79ed8309cf1164af8))

# [2.3.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.2.0...v2.3.0) (2025-10-15)

### Features

- AnyFn type ([#201](https://github.com/noshiro-pf/ts-type-forge/issues/201)) ([9f438de](https://github.com/noshiro-pf/ts-type-forge/commit/9f438de4f02d9351f09842ddfe0b806d86038af2))

# [2.2.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.1.1...v2.2.0) (2025-08-12)

### Features

- update Intersection type implementation ([#143](https://github.com/noshiro-pf/ts-type-forge/issues/143)) ([2bc1464](https://github.com/noshiro-pf/ts-type-forge/commit/2bc1464e84320f212e0415cb090663143bd44e0a))

## [2.1.1](https://github.com/noshiro-pf/ts-type-forge/compare/v2.1.0...v2.1.1) (2025-07-19)

### Bug Fixes

- fix DeepX types ([#111](https://github.com/noshiro-pf/ts-type-forge/issues/111)) ([ec2b8f7](https://github.com/noshiro-pf/ts-type-forge/commit/ec2b8f7469bf235051c983169f5ef854a74e6c58))

# [2.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v2.0.3...v2.1.0) (2025-07-07)

### Features

- NegativeIndexOfTuple ([#103](https://github.com/noshiro-pf/ts-type-forge/issues/103)) ([8a41128](https://github.com/noshiro-pf/ts-type-forge/commit/8a41128d4132639b7d2fe5f384b75bffbede03d8))

## [2.0.3](https://github.com/noshiro-pf/ts-type-forge/compare/v2.0.2...v2.0.3) (2025-06-15)

### Bug Fixes

- update README.md ([#74](https://github.com/noshiro-pf/ts-type-forge/issues/74)) ([2597b55](https://github.com/noshiro-pf/ts-type-forge/commit/2597b5526c7d896aaf64d641482e2f0f98706ea3))

## [2.0.2](https://github.com/noshiro-pf/ts-type-forge/compare/v2.0.1...v2.0.2) (2025-06-06)

### Bug Fixes

- update full API reference in README ([#61](https://github.com/noshiro-pf/ts-type-forge/issues/61)) ([5674f35](https://github.com/noshiro-pf/ts-type-forge/commit/5674f3531c9ad5a4bc68f4176df553bcd8922ff8))

## [2.0.1](https://github.com/noshiro-pf/ts-type-forge/compare/v2.0.0...v2.0.1) (2025-06-06)

### Bug Fixes

- use source-order in typedoc ([#59](https://github.com/noshiro-pf/ts-type-forge/issues/59)) ([11700f9](https://github.com/noshiro-pf/ts-type-forge/commit/11700f9816e6bdf93c9de53eb3ecc784f6b3c398))

# [2.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v1.1.0...v2.0.0) (2025-06-05)

### Features

- add branded number types ([#58](https://github.com/noshiro-pf/ts-type-forge/issues/58)) ([647e903](https://github.com/noshiro-pf/ts-type-forge/commit/647e90329740dffccdcf2c10a0bb27972b1e64e0))

### BREAKING CHANGES

- Renamed some types for branded number types and added many new branded number types.

Co-authored-by: github-actions[bot] <actions@github.com>

# [1.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v1.0.1...v1.1.0) (2025-06-01)

### Features

- add branded-types ([#54](https://github.com/noshiro-pf/ts-type-forge/issues/54)) ([86c462c](https://github.com/noshiro-pf/ts-type-forge/commit/86c462c2046b6b8bc3d1476e5fa0fab91b475620))

## [1.0.1](https://github.com/noshiro-pf/ts-type-forge/compare/v1.0.0...v1.0.1) (2025-05-06)

### Bug Fixes

- fix README ([#18](https://github.com/noshiro-pf/ts-type-forge/issues/18)) ([2fc136d](https://github.com/noshiro-pf/ts-type-forge/commit/2fc136d2e66cd7be2eaeada33bcabfbb72045f47))

# 1.0.0 (2025-05-06)

### Features

- add source and document files ([#7](https://github.com/noshiro-pf/ts-type-forge/issues/7)) ([3d13a20](https://github.com/noshiro-pf/ts-type-forge/commit/3d13a20513afd4b164ca344293c5bae0e6e04b22))
