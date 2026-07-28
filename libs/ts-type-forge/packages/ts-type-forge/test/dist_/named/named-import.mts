// Verifies that the built `dist/` output works through the real
// `package.json` `exports` map via named imports, and that
// `import type { X } from 'ts-type-forge'` only brings the imported names
// into scope: types that are NOT imported must not be accessible via globals
// (no side effects from loading the package), and internal helpers must not
// be importable at all.
//
// This file is self-contained (no test-library imports) so any TypeScript
// version in the compatibility matrix can type-check it.

import type {
  Brand,
  DeepReadonly,
  IsUnion,
  List,
  Primitive,
  StrictOmit,
  Tuple,
  TypeEq,
  UintRange,
  UintRangeInclusive,
  UnknownRecord,
} from 'ts-type-forge';

type ExpectTrue<B extends true> = B;

// ── Imported types are usable ────────────────────────────────────────────

type Email = Brand<string, 'Email'>;

declare const e: Email;

declare const r: UnknownRecord;

type _Cases = readonly [
  ExpectTrue<TypeEq<UintRange<0, 3>, 0 | 1 | 2>>,
  ExpectTrue<TypeEq<UintRangeInclusive<1, 6>, 1 | 2 | 3 | 4 | 5 | 6>>,
  ExpectTrue<
    TypeEq<DeepReadonly<{ a: { b: 1 } }>, Readonly<{ a: Readonly<{ b: 1 }> }>>
  >,
  ExpectTrue<TypeEq<List.Head<readonly [1, 2]>, 1>>,
  ExpectTrue<TypeEq<Tuple.Concat<readonly [1], readonly [2]>, readonly [1, 2]>>,
  ExpectTrue<
    TypeEq<StrictOmit<Readonly<{ a: 1; b: 2 }>, 'a'>, Readonly<{ b: 2 }>>
  >,
  ExpectTrue<IsUnion<'a' | 'b'>>,
  ExpectTrue<
    TypeEq<
      Primitive,
      bigint | boolean | number | string | symbol | null | undefined
    >
  >,
];

export type { _Cases };

// ── Types NOT imported are NOT available globally ────────────────────────
// Each statement below MUST fail to type-check. The `// @ts-expect-error`
// directives turn those failures into successful assertions, so removing
// the directive (or accidentally reintroducing globals) breaks the build.

// @ts-expect-error: `JsonValue` is exported from ts-type-forge but not
// imported in this file, so it must not be reachable globally.
declare const j: JsonValue;

// @ts-expect-error: same as above for `Mutable`.
declare const m: Mutable<Readonly<{ x: 1 }>>;

// @ts-expect-error: same as above for `Seq`.
declare const seq: Seq<3>;

// @ts-expect-error: same as above for `Increment`.
declare const inc: Increment<3>;

// ── Internal types are NOT part of the public API ────────────────────────
// `TSTypeForgeInternals_`-prefixed helpers are re-exported through the
// internal `index.mjs` graph (the generated `global.mts` references them),
// but the public entry point (`entry-point.mts`) must filter them out.
// (Uses `import(...)` type syntax instead of import statements so that
// prettier-plugin-organize-imports does not strip the unused imports.)

// (Short alias names keep each statement on a single line so the directive
// stays attached to the line the error is reported on.)

// @ts-expect-error: internals must not be importable from 'ts-type-forge'.
type _I1 = import('ts-type-forge').TSTypeForgeInternals_BrandEncapsulated;

// @ts-expect-error: same as above for `TSTypeForgeInternals_PickUndefined`.
type _I2 = import('ts-type-forge').TSTypeForgeInternals_PickUndefined;

// Reference the declared bindings so they are "used".
const _ = (_0: typeof e, _1: typeof r): void => undefined;

_(e, r);
