import { expectType } from '../expect-type.mjs';

expectType<ListType.Reverse<readonly []>, readonly []>('=');
expectType<ListType.Reverse<[]>, readonly []>('=');
expectType<ListType.Reverse<readonly [1]>, readonly [1]>('=');
expectType<ListType.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>('=');
expectType<ListType.Reverse<[1, 2, 3]>, readonly [3, 2, 1]>('=');

expectType<ListType.Reverse<readonly number[]>, readonly number[]>('=');

expectType<
  ListType.Reverse<readonly [1, 2, ...(readonly number[])]>,
  readonly [...number[], 2, 1]
>('=');
