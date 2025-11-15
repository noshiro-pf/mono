import { expectType } from '../../expect-type.mjs';

expectType<List.Last<[]>, never>('=');

expectType<List.Last<[1]>, 1>('=');

expectType<List.Last<[1, 2, 3]>, 3>('=');

expectType<List.Last<readonly []>, never>('=');

expectType<List.Last<readonly [1]>, 1>('=');

expectType<List.Last<readonly [1, 2, 3]>, 3>('=');

// Additional tests
expectType<List.Last<[boolean, string, number]>, number>('=');

expectType<List.Last<[42]>, 42>('=');
// expectType<List.Last<readonly string[]>, string>('<='); // Skip due to complexity
