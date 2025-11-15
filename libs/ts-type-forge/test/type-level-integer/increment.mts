import { expectType } from '../expect-type.mjs';

expectType<Increment<3>, 4>('=');

expectType<Increment<0>, 1>('=');

expectType<Increment<64>, 65>('=');

expectType<Increment<1>, 2>('=');

expectType<Increment<0.5>, never>('=');

expectType<Increment<1.2>, never>('=');

expectType<Increment<never>, never>('=');

expectType<Increment<0 | 1 | 2>, 1 | 2 | 3>('=');

expectType<Increment<0 | 1 | 2 | 3>, 1 | 2 | 3 | 4>('=');
