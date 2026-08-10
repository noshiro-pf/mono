import { expectType } from './expect-type.mjs';

expectType<IndexOfTuple<readonly [1, 2, 3]>, 0 | 1 | 2>('=');
expectType<IndexOfTuple<readonly [2, 4, 6, 8, 10]>, 0 | 1 | 2 | 3 | 4>('=');
expectType<IndexOfTuple<readonly []>, never>('=');
// expectType<IndexOfTuple<{ length: 0 }>, 0>('=');
// expectType<IndexOfTuple<{ length: 1 }>, 1>('=');
