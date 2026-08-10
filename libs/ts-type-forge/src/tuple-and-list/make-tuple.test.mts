import { expectType } from 'ts-data-forge';
import { type MakeTuple } from './make-tuple.mjs';

expectType<MakeTuple<3, unknown>, readonly [unknown, unknown, unknown]>('=');

expectType<MakeTuple<0, null>, readonly []>('=');

expectType<MakeTuple<5, 3>, readonly [3, 3, 3, 3, 3]>('=');

// Large tuple (also a smoke test against instantiation-depth limits)
expectType<MakeTuple<1000, 0>['length'], 1000>('=');

// Documents the actual compiler limit that `SupportedLengthCap` (2048) stays
// safely below: tuple types are capped at 10,000 elements, so `MakeTuple`
// works up to N = 9999 and fails with TS2799 ("Type produces a tuple type
// that is too large to represent") from N = 10000.

expectType<MakeTuple<9999, unknown>['length'], 9999>('=');

// @ts-expect-error TS2799: tuple type too large to represent (N >= 10000)
expectType<MakeTuple<10000, unknown>['length'], 10000>('=');
