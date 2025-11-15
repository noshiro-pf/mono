import { expectType } from '../../expect-type.mjs';

expectType<List.Tail<readonly []>, readonly []>('=');

expectType<List.Tail<readonly [1]>, readonly []>('=');

expectType<List.Tail<readonly [1, 2, 3]>, readonly [2, 3]>('=');

expectType<
  List.Tail<readonly [1, 2, 3, ...(readonly number[])]>,
  readonly [2, 3, ...(readonly number[])]
>('=');
