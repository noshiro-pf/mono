import { expectType } from '../../expect-type.mjs';

expectType<List.Take<2, readonly []>, readonly []>('=');
expectType<List.Take<2, readonly [1, 2]>, readonly [1, 2]>('=');
expectType<List.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>('=');
expectType<List.Take<0, readonly [1, 2, 3]>, readonly []>('=');
expectType<List.Take<2, readonly number[]>, readonly number[]>('=');
expectType<List.Take<0, readonly number[]>, readonly number[]>('=');
