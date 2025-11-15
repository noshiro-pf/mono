import { expectType } from '../../expect-type.mjs';

expectType<List.Partition<1, readonly []>, readonly []>('=');

expectType<
  List.Partition<2, readonly [1, 2, 3]>,
  readonly [readonly [1, 2], readonly [3]]
>('=');

expectType<
  List.Partition<3, readonly [1, 2, 3]>,
  readonly [readonly [1, 2, 3]]
>('=');

expectType<
  List.Partition<2, readonly [1, 2, 3, 4]>,
  readonly [readonly [1, 2], readonly [3, 4]]
>('=');
