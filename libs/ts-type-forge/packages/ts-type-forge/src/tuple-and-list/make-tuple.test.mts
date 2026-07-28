import { expectType } from 'ts-data-forge';
import { type MakeTuple } from './make-tuple.mjs';

expectType<MakeTuple<unknown, 3>, readonly [unknown, unknown, unknown]>('=');

expectType<MakeTuple<null, 0>, readonly []>('=');

expectType<MakeTuple<3, 5>, readonly [3, 3, 3, 3, 3]>('=');

// Large tuple (also a smoke test against instantiation-depth limits)
expectType<MakeTuple<0, 1000>['length'], 1000>('=');

// Documents the actual compiler limit that `SupportedLengthCap` (2048) stays
// safely below: tuple types are capped at 10,000 elements, so `MakeTuple`
// works up to N = 9999 and fails with TS2799 ("Type produces a tuple type
// that is too large to represent") from N = 10000.

expectType<MakeTuple<unknown, 9999>['length'], 9999>('=');

// @ts-expect-error TS2799: tuple type too large to represent (N >= 10000)
expectType<MakeTuple<unknown, 10000>['length'], 10000>('=');
