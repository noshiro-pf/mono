import { expectType } from '../expect-type.mjs';

expectType<Tuple.Take<2, readonly []>, readonly []>('=');
expectType<Tuple.Take<2, readonly [1, 2]>, readonly [1, 2]>('=');
expectType<Tuple.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>('=');
expectType<Tuple.Take<0, readonly [1, 2, 3]>, readonly []>('=');
