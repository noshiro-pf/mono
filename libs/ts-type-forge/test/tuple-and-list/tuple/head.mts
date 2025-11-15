import { expectType } from '../../expect-type.mjs';

expectType<Tuple.Head<[]>, never>('=');

expectType<Tuple.Head<[1]>, 1>('=');

expectType<Tuple.Head<[1, 2], 0>, 1>('=');

expectType<Tuple.Head<[], 1>, 1>('=');

expectType<Tuple.Head<readonly []>, never>('=');

expectType<Tuple.Head<readonly [1]>, 1>('=');

expectType<Tuple.Head<readonly [1, 2], 0>, 1>('=');

expectType<Tuple.Head<readonly [], 1>, 1>('=');

// Additional tests
expectType<Tuple.Head<[1, 2, 3]>, 1>('=');

expectType<Tuple.Head<[], 'default'>, 'default'>('=');

expectType<Tuple.Head<[boolean, string, number]>, boolean>('=');

expectType<Tuple.Head<[42]>, 42>('=');

expectType<Tuple.Head<[string, number, boolean]>, string>('=');
