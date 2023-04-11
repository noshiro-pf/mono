import { type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.Concat<readonly [], readonly []>, readonly []>('=');
expectType<Tuple.Concat<readonly [1, 2], readonly []>, readonly [1, 2]>('=');
expectType<Tuple.Concat<readonly [], readonly [1, 2]>, readonly [1, 2]>('=');
expectType<
  Tuple.Concat<readonly [1, 2], readonly [3, 4, 5]>,
  readonly [1, 2, 3, 4, 5]
>('=');
