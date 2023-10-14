import { type ListType } from '../../src';
import { expectType } from '../expect-type';
import { type _DeepReadonly as DeepReadonly } from '../utils-for-test';

expectType<ListType.Flatten<DeepReadonly<[]>>, readonly []>('=');
expectType<ListType.Flatten<DeepReadonly<[[]]>>, readonly []>('=');
expectType<
  ListType.Flatten<DeepReadonly<[[1, 2], [], [3]]>>,
  readonly [1, 2, 3]
>('=');
expectType<ListType.Flatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>(
  '=',
);
expectType<
  ListType.Flatten<DeepReadonly<[[1, 2], [3], []]>>,
  readonly [1, 2, 3]
>('=');
expectType<
  ListType.Flatten<DeepReadonly<[[], [1, 2], [3]]>>,
  readonly [1, 2, 3]
>('=');
