import { type ArrayOfLength, type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.Zip<readonly [], readonly []>, readonly []>('=');
expectType<Tuple.Zip<readonly [1], readonly []>, readonly []>('=');
expectType<Tuple.Zip<readonly [], readonly [1]>, readonly []>('=');

// <= かつ >= だが "=" だとエラーになってしまう
expectType<
  Tuple.Zip<ArrayOfLength<32, 1>, ArrayOfLength<32, 2>>,
  ArrayOfLength<32, readonly [1, 2]>
>('<=');
expectType<
  ArrayOfLength<32, readonly [1, 2]>,
  Tuple.Zip<ArrayOfLength<32, 1>, ArrayOfLength<32, 2>>
>('<=');

expectType<
  Tuple.Zip<readonly [1, 2, 3], readonly [4, 5]>,
  readonly [readonly [1, 4], readonly [2, 5]]
>('=');
