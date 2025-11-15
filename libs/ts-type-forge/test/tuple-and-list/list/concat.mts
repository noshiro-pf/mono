import { expectType } from '../../expect-type.mjs';

expectType<List.Concat<readonly [], readonly []>, readonly []>('=');

expectType<List.Concat<readonly [1, 2], readonly []>, readonly [1, 2]>('=');

expectType<List.Concat<readonly [], readonly [1, 2]>, readonly [1, 2]>('=');

expectType<
  List.Concat<readonly [1, 2], readonly [3, 4, 5]>,
  readonly [1, 2, 3, 4, 5]
>('=');
