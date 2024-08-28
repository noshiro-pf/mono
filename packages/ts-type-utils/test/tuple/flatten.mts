import { expectType } from '../expect-type.mjs';
import { type DeepReadonly_ as DeepReadonly } from '../utils-for-test.mjs';

expectType<Tuple.Flatten<DeepReadonly<[]>>, readonly []>('=');
expectType<Tuple.Flatten<DeepReadonly<[[]]>>, readonly []>('=');
expectType<Tuple.Flatten<DeepReadonly<[[1, 2], [], [3]]>>, readonly [1, 2, 3]>(
  '=',
);
expectType<Tuple.Flatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>('=');
expectType<Tuple.Flatten<DeepReadonly<[[1, 2], [3], []]>>, readonly [1, 2, 3]>(
  '=',
);
expectType<Tuple.Flatten<DeepReadonly<[[], [1, 2], [3]]>>, readonly [1, 2, 3]>(
  '=',
);
