import { expectType } from '../../expect-type.mjs';

expectType<List.SkipLast<0, readonly []>, readonly []>('=');

expectType<List.SkipLast<1, readonly []>, readonly []>('=');

expectType<List.SkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');

expectType<List.SkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>('=');

expectType<List.SkipLast<5, readonly [1, 2, 3]>, readonly []>('=');

expectType<List.SkipLast<5, readonly number[]>, readonly number[]>('=');
