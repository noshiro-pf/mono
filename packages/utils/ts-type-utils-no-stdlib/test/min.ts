import { type Index, type Min } from '../src';
import { expectType } from './expect-type';

expectType<Min<0 | 1 | 2>, 0>('=');
expectType<Min<0>, 0>('=');
expectType<Min<0 | 1 | 3 | 5 | 6>, 0>('=');
expectType<Min<0 | 0 | 1 | 3 | 5 | 6>, 0>('=');
expectType<Min<6 | 6>, 6>('=');
expectType<Min<Index<64>>, 0>('=');

// invalid input
expectType<Min<never>, never>('=');
