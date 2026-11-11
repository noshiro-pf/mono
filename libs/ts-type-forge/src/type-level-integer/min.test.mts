import { expectType } from 'ts-data-forge';
import type { Uint10 } from '../constants/index.mjs';
import type { Index } from './index-type.mjs';
import type { Min } from './min.mjs';

expectType<Min<0 | 1 | 2>, 0>('=');

expectType<Min<0>, 0>('=');

expectType<Min<0 | 1 | 3 | 5 | 6>, 0>('=');

expectType<Min<0 | 0 | 1 | 3 | 5 | 6>, 0>('=');

expectType<Min<6 | 6>, 6>('=');

expectType<Min<Index<64>>, 0>('=');

// invalid input
expectType<Min<never>, never>('=');

// Every member of `Uint10`, across the steps the implementation takes.
expectType<Min<999>, 999>('=');

expectType<Min<1000>, 1000>('=');

expectType<Min<1023>, 1023>('=');

expectType<Min<1000 | 1023>, 1000>('=');

expectType<Min<Uint10>, 0>('=');

expectType<Min<31>, 31>('=');

expectType<Min<32>, 32>('=');

expectType<Min<31 | 64>, 31>('=');

expectType<Min<33 | 64>, 33>('=');
