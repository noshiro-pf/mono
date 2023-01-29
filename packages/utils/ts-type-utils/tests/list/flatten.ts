import { type DeepReadonly, type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.Flatten<DeepReadonly<[]>>, readonly []>('=');
expectType<ListType.Flatten<DeepReadonly<[[]]>>, readonly []>('=');
expectType<
  ListType.Flatten<DeepReadonly<[[1, 2], [], [3]]>>,
  readonly [1, 2, 3]
>('=');
expectType<ListType.Flatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>(
  '='
);
expectType<
  ListType.Flatten<DeepReadonly<[[1, 2], [3], []]>>,
  readonly [1, 2, 3]
>('=');
expectType<
  ListType.Flatten<DeepReadonly<[[], [1, 2], [3]]>>,
  readonly [1, 2, 3]
>('=');
