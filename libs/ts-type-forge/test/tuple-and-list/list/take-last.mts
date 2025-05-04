import { expectType } from '../../expect-type.mjs';

expectType<List.TakeLast<2, readonly []>, readonly []>('=');
expectType<List.TakeLast<2, readonly [1, 2]>, readonly [1, 2]>('=');
expectType<List.TakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>('=');
expectType<List.TakeLast<0, readonly [1, 2, 3]>, readonly []>('=');
expectType<List.TakeLast<2, readonly number[]>, readonly number[]>('=');
expectType<List.TakeLast<0, readonly number[]>, readonly number[]>('=');
