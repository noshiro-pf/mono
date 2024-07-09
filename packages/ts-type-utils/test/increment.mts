import { expectType } from './expect-type.mjs';

expectType<Increment<3>, 4>('=');
expectType<Increment<0>, 1>('=');
expectType<Increment<64>, 65>('=');
expectType<Decrement<3>, 2>('=');
expectType<Decrement<1>, 0>('=');
expectType<Decrement<0>, 0>('=');
