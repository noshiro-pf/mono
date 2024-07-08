import { expectType } from '../expect-type.mjs';

expectType<ListType.SetAt<readonly [], 2, 999>, readonly []>('=');
expectType<ListType.SetAt<readonly [1, 2], 2, 999>, readonly [1, 2]>('=');
expectType<ListType.SetAt<readonly [1, 2, 3], 1, 999>, readonly [1, 999, 3]>(
  '=',
);
expectType<ListType.SetAt<readonly [1, 2, 3], 0, 999>, readonly [999, 2, 3]>(
  '=',
);
