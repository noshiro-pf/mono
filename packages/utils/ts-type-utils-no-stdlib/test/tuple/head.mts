import { expectType } from '../expect-type.mjs';

expectType<Tuple.Head<[]>, never>('=');
expectType<Tuple.Head<[1]>, 1>('=');
expectType<Tuple.Head<[1, 2], 0>, 1>('=');
expectType<Tuple.Head<[], 1>, 1>('=');

expectType<Tuple.Head<readonly []>, never>('=');
expectType<Tuple.Head<readonly [1]>, 1>('=');
expectType<Tuple.Head<readonly [1, 2], 0>, 1>('=');
expectType<Tuple.Head<readonly [], 1>, 1>('=');
