import { expectType } from '../expect-type.mjs';

expectType<ListType.Tail<readonly []>, readonly []>('=');
expectType<ListType.Tail<readonly [1]>, readonly []>('=');
expectType<ListType.Tail<readonly [1, 2, 3]>, readonly [2, 3]>('=');
expectType<
  ListType.Tail<readonly [1, 2, 3, ...(readonly number[])]>,
  readonly [2, 3, ...(readonly number[])]
>('=');
