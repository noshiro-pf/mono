import { type IndexOfTuple } from '../src';
import { expectType } from './expect-type';

expectType<IndexOfTuple<readonly [1, 2, 3]>, 0 | 1 | 2>('=');
expectType<IndexOfTuple<readonly unknown[]>, number>('=');
