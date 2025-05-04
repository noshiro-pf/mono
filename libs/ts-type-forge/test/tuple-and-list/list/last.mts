import { expectType } from '../../expect-type.mjs';

expectType<List.Last<[]>, never>('=');
expectType<List.Last<[1]>, 1>('=');
expectType<List.Last<[1, 2, 3]>, 3>('=');

expectType<List.Last<readonly []>, never>('=');
expectType<List.Last<readonly [1]>, 1>('=');
expectType<List.Last<readonly [1, 2, 3]>, 3>('=');
