import { type IndexOfTuple, type Uint32 } from '../src';
import { expectType } from './expect-type';

expectType<IndexOfTuple<readonly [1, 2, 3]>, 0 | 1 | 2>('=');
expectType<IndexOfTuple<readonly unknown[]>, Uint32>('=');
