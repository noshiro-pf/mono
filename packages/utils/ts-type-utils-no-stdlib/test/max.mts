import { expectType } from './expect-type.mjs';

expectType<Max<0 | 1 | 2>, 2>('=');
expectType<Max<0>, 0>('=');
expectType<Max<0 | 1 | 3 | 5 | 6>, 6>('=');
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
expectType<Max<0 | 1 | 3 | 5 | 6 | 6>, 6>('=');
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
expectType<Max<6 | 6>, 6>('=');
expectType<Max<Index<64>>, 63>('=');

// invalid input
expectType<Max<never>, never>('=');
