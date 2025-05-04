import { expectType } from '../expect-type.mjs';

expectType<Decrement<3>, 2>('=');
expectType<Decrement<1>, 0>('=');
expectType<Decrement<64>, 63>('=');
expectType<Decrement<0>, 0>('=');
expectType<Decrement<-1>, never>('=');
expectType<Decrement<1.2>, never>('=');
expectType<Decrement<never>, never>('=');
expectType<Decrement<0 | 1 | 2>, 0 | 1>('=');
expectType<Decrement<0 | 1 | 2 | 3>, 0 | 1 | 2>('=');
