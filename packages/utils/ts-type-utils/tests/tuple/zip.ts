import { type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.Zip<readonly [], readonly []>, readonly []>('=');
expectType<Tuple.Zip<readonly [1], readonly []>, readonly []>('=');
expectType<Tuple.Zip<readonly [], readonly [1]>, readonly []>('=');

expectType<
  Tuple.Zip<readonly [1, 2, 3], readonly [4, 5]>,
  readonly [readonly [1, 4], readonly [2, 5]]
>('=');
