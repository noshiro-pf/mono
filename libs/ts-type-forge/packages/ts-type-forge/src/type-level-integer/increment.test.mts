import { expectType } from 'ts-data-forge';
import { type Decrement, type Increment } from './increment.mjs';

expectType<Increment<3>, 4>('=');

expectType<Increment<0>, 1>('=');

expectType<Increment<64>, 65>('=');

expectType<Increment<1>, 2>('=');

expectType<Increment<0.5>, never>('=');

expectType<Increment<1.2>, never>('=');

expectType<Increment<never>, never>('=');

expectType<Increment<0 | 1 | 2>, 1 | 2 | 3>('=');

expectType<Increment<0 | 1 | 2 | 3>, 1 | 2 | 3 | 4>('=');

expectType<Decrement<3>, 2>('=');

expectType<Decrement<1>, 0>('=');

expectType<Decrement<64>, 63>('=');

expectType<Decrement<0>, 0>('=');

expectType<Decrement<-1>, never>('=');

expectType<Decrement<1.2>, never>('=');

expectType<Decrement<never>, never>('=');

expectType<Decrement<0 | 1 | 2>, 0 | 1>('=');

expectType<Decrement<0 | 1 | 2 | 3>, 0 | 1 | 2>('=');
