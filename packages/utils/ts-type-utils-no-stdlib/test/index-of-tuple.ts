import { type IndexOfTuple, type SafeUint } from '../src';
import { expectType } from './expect-type';

expectType<IndexOfTuple<readonly [1, 2, 3]>, 0 | 1 | 2>('=');
expectType<IndexOfTuple<readonly []>, never>('=');
// expectType<IndexOfTuple<{ length: 0 }>, 0>('=');
// expectType<IndexOfTuple<{ length: 1 }>, 1>('=');
expectType<IndexOfTuple<readonly unknown[]>, SafeUint>('=');
