import { type Index, type Max } from '../src';
import { expectType } from './expect-type';

expectType<Max<0 | 1 | 2>, 2>('=');
expectType<Max<0>, 0>('=');
expectType<Max<0 | 1 | 3 | 5 | 6>, 6>('=');
expectType<Max<0 | 1 | 3 | 5 | 6 | 6>, 6>('=');
expectType<Max<6 | 6>, 6>('=');
expectType<Max<Index<64>>, 63>('=');

// invalid input
expectType<Max<never>, never>('=');
