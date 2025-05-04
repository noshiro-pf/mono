import { expectType } from '../../expect-type.mjs';

expectType<List.SetAt<readonly [], 2, 999>, readonly []>('=');
expectType<List.SetAt<readonly [1, 2], 2, 999>, readonly [1, 2]>('=');
expectType<List.SetAt<readonly [1, 2, 3], 1, 999>, readonly [1, 999, 3]>('=');
expectType<List.SetAt<readonly [1, 2, 3], 0, 999>, readonly [999, 2, 3]>('=');
