// Verifies that `import type { X } from 'ts-type-forge'` only brings the
// imported names into scope. Types that are NOT imported must not be
// accessible via globals (no side effects from loading the package).
//
// This file is type-checked with a dedicated tsconfig
// (`test/imports/tsconfig.named.json`) that excludes `src/global.mts`
// to mirror the way an external consumer sees the package when only using
// named imports.

import type {
  Brand,
  DeepReadonly,
  Primitive,
  TypeEq,
  UintRangeInclusive,
  UnknownRecord,
} from 'ts-type-forge';

import { expectType } from 'ts-data-forge';

// ── Imported types are usable ────────────────────────────────────────────

type Email = Brand<string, 'Email'>;

type Dice = UintRangeInclusive<1, 6>;

expectType<Dice, 1 | 2 | 3 | 4 | 5 | 6>('=');
expectType<TypeEq<string, string>, true>('=');
expectType<
  Primitive,
  bigint | boolean | number | string | symbol | null | undefined
>('=');

declare const e: Email;

declare const r: UnknownRecord;

type ReadonlyShape = DeepReadonly<{ a: { b: number } }>;

declare const s: ReadonlyShape;

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

// Reference the bindings so `noUnusedLocals` does not fire.
const _ = (
  _0: typeof e,
  _1: typeof r,
  _2: typeof s,
  _3: typeof j,
  _4: typeof m,
  _5: typeof seq,
  _6: typeof inc,
): void => undefined;

_(e, r, s, j, m, seq, inc);
