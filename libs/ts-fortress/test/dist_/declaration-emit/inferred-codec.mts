// Codecs declared the way a consumer declares them: at module scope, with no
// type annotation, their value types derived from them. Declaration emit
// writes the inferred type of each const out structurally, so the emitted
// `.d.mts` asks the bound of `TypeOf` to accept the structural form each
// combinator's result takes — `tsconfig.emitted.json` type-checks the emitted
// file to see that it does.
//
// Inside this module `typeof R` is still the `Type` alias, so the calls below
// do not put a combinator's own bound to the structural form: that is
// `src/type.test.mts`.

import * as t from 'ts-fortress';

export const R = t.record({ a: t.string(), b: t.optional(t.number()) });

export type R = t.TypeOf<typeof R>;

export const Rs = t.array(R);

export type Rs = t.TypeOf<typeof Rs>;

export const U = t.union([R, t.undefinedType]);

export type U = t.TypeOf<typeof U>;

export const Tpl = t.tuple([R, t.string()]);

export type Tpl = t.TypeOf<typeof Tpl>;

export const C = t.record({ c: t.boolean() });

export const I = t.intersection(
  [R, C],
  t.record({ a: t.string(), b: t.optional(t.number()), c: t.boolean() }),
);

export type I = t.TypeOf<typeof I>;

export const M = t.MapType(t.string(), R);

export type M = t.TypeOf<typeof M>;

export const S = t.SetType(R);

export type S = t.TypeOf<typeof S>;

export const KV = t.keyValueRecord(t.string(), R);

export type KV = t.TypeOf<typeof KV>;

export const P = t.partial(R);

export type P = t.TypeOf<typeof P>;

export const Picked = t.pick(R, ['a']);

export type Picked = t.TypeOf<typeof Picked>;

export const Annotated = t.annotate(R, { title: 'R' });

export type Annotated = t.TypeOf<typeof Annotated>;

// A bound of a consumer's own, named through the public entry: the emitted
// `OwnBound<typeof R>` puts it to the structural form of `R`.
export type OwnBound<C extends t.UnknownType> = t.TypeOf<C>;

export type ROwn = OwnBound<typeof R>;
