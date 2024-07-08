import { expectType } from '../expect-type.mjs';

expectType<Tuple.Tail<readonly []>, readonly []>('=');
expectType<Tuple.Tail<readonly [1]>, readonly []>('=');
expectType<Tuple.Tail<readonly [1, 2, 3]>, readonly [2, 3]>('=');
