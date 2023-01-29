import { type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.Partition<1, readonly []>, readonly []>('=');
expectType<
  Tuple.Partition<2, readonly [1, 2, 3]>,
  readonly [readonly [1, 2], readonly [3]]
>('=');
expectType<
  Tuple.Partition<3, readonly [1, 2, 3]>,
  readonly [readonly [1, 2, 3]]
>('=');
expectType<
  Tuple.Partition<2, readonly [1, 2, 3, 4]>,
  readonly [readonly [1, 2], readonly [3, 4]]
>('=');
