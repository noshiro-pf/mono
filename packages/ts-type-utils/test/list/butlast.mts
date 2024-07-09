import { expectType } from '../expect-type.mjs';

expectType<ListType.ButLast<readonly []>, readonly []>('=');
expectType<ListType.ButLast<readonly [1]>, readonly []>('=');
expectType<ListType.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>('=');
expectType<
  ListType.ButLast<readonly [1, 2, 3, ...(readonly number[])]>,
  readonly [1, 2, 3, ...(readonly number[])]
>('=');
