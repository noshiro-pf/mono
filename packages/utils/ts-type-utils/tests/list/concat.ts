import { type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.Concat<readonly [], readonly []>, readonly []>('=');
expectType<ListType.Concat<readonly [1, 2], readonly []>, readonly [1, 2]>('=');
expectType<ListType.Concat<readonly [], readonly [1, 2]>, readonly [1, 2]>('=');
expectType<
  ListType.Concat<readonly [1, 2], readonly [3, 4, 5]>,
  readonly [1, 2, 3, 4, 5]
>('=');
