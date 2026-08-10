import { expectType } from '../expect-type.mjs';

expectType<Tuple.ButLast<readonly []>, readonly []>('=');
expectType<Tuple.ButLast<readonly [1]>, readonly []>('=');
expectType<Tuple.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>('=');
