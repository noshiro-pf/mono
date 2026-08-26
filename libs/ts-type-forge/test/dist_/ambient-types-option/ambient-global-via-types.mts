// Verifies that naming `ts-type-forge/global` in the tsconfig's
// `compilerOptions.types` (see ./tsconfig.json) opts the whole program in to
// ambient access for every public ts-type-forge type — the same thing
// ../ambient/ambient-global.mts asserts for the triple-slash form, minus the
// directive: nothing in this file mentions ts-type-forge at all, which is the
// entire point of the tsconfig-only form.
//
// This file is self-contained (no test-library imports) so that older
// TypeScript versions can type-check it too.

type ExpectTrue<B extends true> = B;

type Email = Brand<string, 'Email'>;

type Dice = UintRangeInclusive<1, 6>;

type _Cases = readonly [
  ExpectTrue<TypeEq<Dice, 1 | 2 | 3 | 4 | 5 | 6>>,
  ExpectTrue<TypeEq<string, string>>,
  // transformer-ignore-next-line convert-to-readonly
  ExpectTrue<TypeEq<Mutable<Readonly<{ x: 1 }>>, { x: 1 }>>,
  ExpectTrue<TypeEq<List.Last<readonly [1, 2, 3]>, 3>>,
  ExpectTrue<
    TypeEq<Tuple.MapTo<boolean, readonly [1, 'a']>, readonly [boolean, boolean]>
  >,
  ExpectTrue<TypeEq<JsonPrimitive, boolean | number | string | null>>,
];

export type { _Cases };

// `JsonValue`, `Mutable`, `Seq`, `Increment` are all reachable without any
// `import` statement and without a triple-slash directive.
declare const e: Email;

declare const j: JsonValue;

declare const m: Mutable<Readonly<{ x: 1 }>>;

declare const seq: Seq<3>;

declare const inc: Increment<3>;

declare const p: Primitive;

declare const r: UnknownRecord;

// Reference the declared bindings so they are "used".
const _ = (
  _0: typeof e,
  _1: typeof j,
  _2: typeof m,
  _3: typeof seq,
  _4: typeof inc,
  _5: typeof p,
  _6: typeof r,
): void => undefined;

_(e, j, m, seq, inc, p, r);
