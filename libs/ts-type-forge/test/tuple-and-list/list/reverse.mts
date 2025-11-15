import { expectType } from '../../expect-type.mjs';

expectType<List.Reverse<readonly []>, readonly []>('=');

expectType<List.Reverse<[]>, readonly []>('=');

expectType<List.Reverse<readonly [1]>, readonly [1]>('=');

expectType<List.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>('=');

expectType<List.Reverse<[1, 2, 3]>, readonly [3, 2, 1]>('=');

expectType<List.Reverse<readonly number[]>, readonly number[]>('=');

expectType<
  List.Reverse<readonly [1, 2, ...(readonly number[])]>,
  readonly [...number[], 2, 1]
>('=');
