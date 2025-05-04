import { expectType } from '../../expect-type.mjs';

expectType<List.Skip<0, readonly []>, readonly []>('=');
expectType<List.Skip<1, readonly []>, readonly []>('=');
expectType<List.Skip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<List.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>('=');
expectType<List.Skip<5, readonly [1, 2, 3]>, readonly []>('=');
expectType<List.Skip<5, readonly number[]>, readonly number[]>('=');
