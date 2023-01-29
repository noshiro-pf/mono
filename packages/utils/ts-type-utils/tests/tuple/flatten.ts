import { type DeepReadonly, type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.Flatten<DeepReadonly<[]>>, readonly []>('=');
expectType<Tuple.Flatten<DeepReadonly<[[]]>>, readonly []>('=');
expectType<Tuple.Flatten<DeepReadonly<[[1, 2], [], [3]]>>, readonly [1, 2, 3]>(
  '='
);
expectType<Tuple.Flatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>('=');
expectType<Tuple.Flatten<DeepReadonly<[[1, 2], [3], []]>>, readonly [1, 2, 3]>(
  '='
);
expectType<Tuple.Flatten<DeepReadonly<[[], [1, 2], [3]]>>, readonly [1, 2, 3]>(
  '='
);
