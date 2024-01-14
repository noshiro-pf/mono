import { expectType } from '../expect-type.mjs';
import { type _DeepReadonly as DeepReadonly } from '../utils-for-test.mjs';

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
