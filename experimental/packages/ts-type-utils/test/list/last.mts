import { expectType } from '../expect-type.mjs';

expectType<ListType.Last<[]>, never>('=');
expectType<ListType.Last<[1]>, 1>('=');
expectType<ListType.Last<[1, 2, 3]>, 3>('=');

expectType<ListType.Last<readonly []>, never>('=');
expectType<ListType.Last<readonly [1]>, 1>('=');
expectType<ListType.Last<readonly [1, 2, 3]>, 3>('=');
