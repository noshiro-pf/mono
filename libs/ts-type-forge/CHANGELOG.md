# [7.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v6.1.0...v7.0.0) (2026-07-18)

- feat!: make NonEmptyArray brand-based; add MutableMinLengthArray ([#417](https://github.com/noshiro-pf/ts-type-forge/issues/417)) ([080a6f9](https://github.com/noshiro-pf/ts-type-forge/commit/080a6f92edec46364f6f323782b6574d1912fc28))

### BREAKING CHANGES

- NonEmptyArray / MutableNonEmptyArray are now brand-based
  (MinLengthArray<1> / MutableMinLengthArray<1>); a plain array literal is no
  longer directly assignable to them. Use NonEmptyTuple / MutableNonEmptyTuple
  for the previous structural types.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- feat: add Mutable{Max,Bounded,Fixed}LengthArray for family symmetry

Add the mutable branded counterparts of the readonly length-constrained
array family so every readonly variant has a matching mutable one:

- MutableMaxLengthArray (structural part: mutable `Elm[]`)
- MutableBoundedLengthArray (= MutableMaxLengthArray & MutableMinLengthArray)
- MutableFixedLengthArray (mutable structural tuple for Length <= 10)

Each shares the same brand as its readonly counterpart, so the mutable
variant is assignable to the readonly one. Adds type-level tests, JSDoc
examples with matching sample files, and regenerates global.mts/index/docs.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

# [6.1.0](https://github.com/noshiro-pf/ts-type-forge/compare/v6.0.0...v6.1.0) (2026-07-18)

### Features

- add Float16 type ([#416](https://github.com/noshiro-pf/ts-type-forge/issues/416)) ([d7c4634](https://github.com/noshiro-pf/ts-type-forge/commit/d7c4634bbb1f2ea0658e34369c91ec284bb41e49))

# [6.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v5.0.0...v6.0.0) (2026-07-17)

- feat!: add brand-based length-constrained array types ([#415](https://github.com/noshiro-pf/ts-type-forge/issues/415)) ([6bd2f13](https://github.com/noshiro-pf/ts-type-forge/commit/6bd2f131515e8324917ca43954b890c12442feb9))

### BREAKING CHANGES

- ArrayOfLength, ArrayAtLeastLen, ArrayAtMostLen,
  ArrayBoundedLen and their Mutable* variants have been renamed to
  FixedLengthTuple, MinLengthTuple, MaxLengthTuple, BoundedLengthTuple
  and Mutable* counterparts; the old names are no longer exported. The
  branded array types now include a structural tuple prefix.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- docs: reflect tuple-family function renames in the design report

The tuple-based guards/validators in ts-data-forge and ts-fortress are
now renamed to match the type names (isFixedLengthTuple /
fixedLengthTuple etc.), so the report no longer lists this as deferred
work.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- refactor: move length-constrained tuple family into its own file

Split the {Fixed,Min,Max,Bounded}LengthTuple family (and their Mutable*
variants) out of src/tuple-and-list/array.mts into
src/tuple-and-list/length-constrained-tuple.mts, mirroring
length-constrained-string.mts and length-constrained-array.mts.
array.mts now only contains the general array utilities
(NonEmptyArray, MutableNonEmptyArray, ArrayElement).

No public API change: all exports still go through the generated index
files. The README type listing is regenerated accordingly.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- docs: embed branded-array JSDoc examples from samples and regenerate docs

Add sample files for the length-constrained array family under
samples/src/branded-types/predefined-arrays/ and register them in the
embed-examples-in-jsdoc map so their JSDoc @example blocks are embedded
by the doc pipeline like the other branded types. The Min/Fixed
examples now also demonstrate the hybrid structural prefix (in-range
indexed access without `undefined`, literal `length`).

Regenerate the committed TypeDoc output (docs/) and README, which had
gone stale after the tuple-family renames and file split, fixing the
style-check (doc) CI job.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- docs: mention runtime-checked as* casts in the design report

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- feat: cap length parameters of branded array types at 2048

Constrain the length type parameters of MaxLengthArray /
MinLengthArray / BoundedLengthArray / FixedLengthArray to the new
exported SupportedArrayLength union (0 | 1 | ... | 2048). The brand
encoding relies on MakeTuple, which breaks down near TypeScript's
10,000-element tuple limit; the cap rejects excessive literals (and
non-literal `number`, for which the brand would be meaningless) with a
readable constraint error instead of a deep-instantiation error.

The constraint is effectively free for the type checker: the union is
built once per program and cached, and each instantiation only adds a
single union-membership check (measured: no per-use cost, one-time
fixed cost of ~7k types).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- feat!: share the length cap across string/array brands; export boundaries

Generalize the 2048 length cap introduced for the branded array types
to the whole branded length-constrained family:

- New src/branded-types/supported-length.mts exports SupportedLengthCap
  (2048) and SupportedLength (0 | 1 | ... | 2048), replacing the
  array-local SupportedArrayLength.
- MaxLengthString / MinLengthString / BoundedLengthString /
  FixedLengthString now constrain their length parameters with
  SupportedLength as well (they share the same MakeTuple-based brand
  encoding and hence the same compiler limits).
- StructuralPrefixCap (10) — the boundary between expanding the minimum
  length into structural tuple positions and falling back to
  `readonly Elm[]` — is now exported so downstream libraries can share
  the same boundary instead of hard-coding their own.

* the length parameters of the branded string types
  (MaxLengthString etc.) are now constrained to SupportedLength
  (0..2048); larger literals and non-literal `number` are rejected.
  SupportedArrayLength has been renamed to SupportedLength.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- docs: regenerate docs with source links for supported-length.mts

TypeDoc omits GitHub source links for files that are not yet committed
at generation time; regenerate now that the file is committed, fixing
the style-check (doc) CI job.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

- feat: export StructuralPrefixLength and pin down the MakeTuple limit

* Export StructuralPrefixLength (0 | 1 | ... | 10, the union at or
  below StructuralPrefixCap) so that downstream libraries can use the
  "expand into a structural tuple vs fall back to readonly Elm[]"
  boundary as a type-parameter constraint.
* Add a boundary type test documenting the actual compiler limit that
  SupportedLengthCap (2048) stays below: MakeTuple works up to
  N = 9999 and fails with TS2799 from N = 10000 (identical on
  TypeScript 6 and TypeScript 7 native).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017TbKfKmkWsYMtbb1Ef6e1t

# [5.0.0](https://github.com/noshiro-pf/ts-type-forge/compare/v4.0.0...v5.0.0) (2026-07-09)

- feat!: add length-constrained branded string types and redefine NonEmptyString ([#406](https://github.com/noshiro-pf/ts-type-forge/issues/406)) ([0cbec25](https://github.com/noshiro-pf/ts-type-forge/commit/0cbec25b25dda25162db26046b73d304eb3dd418))

### BREAKING CHANGES

- `NonEmptyString` no longer carries the `'NonEmptyString'`
  brand key. It is now `Brand`-compatible with `MinLengthString<1>` instead
  of a standalone `Brand<string, 'NonEmptyString'>`. Values that were cast to
  `NonEmptyString` via the old brand key, or code that inspected the brand
  keys (e.g. `UnwrapBrandTrueKeys`), will observe a different brand shape.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VfbfUoEnhGNsnmmbb8w9TB

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
