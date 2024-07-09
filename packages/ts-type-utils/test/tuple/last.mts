import { expectType } from '../expect-type.mjs';

expectType<Tuple.Last<[]>, never>('=');
expectType<Tuple.Last<[1]>, 1>('=');
expectType<Tuple.Last<[1, 2, 3]>, 3>('=');

expectType<Tuple.Last<readonly []>, never>('=');
expectType<Tuple.Last<readonly [1]>, 1>('=');
expectType<Tuple.Last<readonly [1, 2, 3]>, 3>('=');
