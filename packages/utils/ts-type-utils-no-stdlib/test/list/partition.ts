import { type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.Partition<1, readonly []>, readonly []>('=');
expectType<
  ListType.Partition<2, readonly [1, 2, 3]>,
  readonly [readonly [1, 2], readonly [3]]
>('=');
expectType<
  ListType.Partition<3, readonly [1, 2, 3]>,
  readonly [readonly [1, 2, 3]]
>('=');
expectType<
  ListType.Partition<2, readonly [1, 2, 3, 4]>,
  readonly [readonly [1, 2], readonly [3, 4]]
>('=');
