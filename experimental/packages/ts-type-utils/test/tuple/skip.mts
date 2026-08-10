import { expectType } from '../expect-type.mjs';

expectType<Tuple.Skip<0, readonly []>, readonly []>('=');
expectType<Tuple.Skip<1, readonly []>, readonly []>('=');
expectType<Tuple.Skip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<Tuple.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>('=');
expectType<Tuple.Skip<5, readonly [1, 2, 3]>, readonly []>('=');
