import { expectType } from 'ts-data-forge';
import type { Uint10 } from '../constants/index.mjs';
import type { Index } from './index-type.mjs';
import type { Max } from './max.mjs';

expectType<Max<0 | 1 | 2>, 2>('=');

expectType<Max<0>, 0>('=');

expectType<Max<0 | 1 | 3 | 5 | 6>, 6>('=');

expectType<Max<0 | 1 | 3 | 5 | 6 | 6>, 6>('=');

expectType<Max<6 | 6>, 6>('=');

expectType<Max<Index<64>>, 63>('=');

// invalid input
expectType<Max<never>, never>('=');

// Every member of `Uint10`, across the steps the implementation takes.
expectType<Max<999>, 999>('=');

expectType<Max<1000>, 1000>('=');

expectType<Max<1023>, 1023>('=');

expectType<Max<Uint10>, 1023>('=');

expectType<Max<0 | 1023>, 1023>('=');

expectType<Max<31>, 31>('=');

expectType<Max<32>, 32>('=');

expectType<Max<31 | 32>, 32>('=');

expectType<Max<33 | 64>, 64>('=');
