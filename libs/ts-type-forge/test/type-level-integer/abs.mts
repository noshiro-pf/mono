import { expectType } from '../expect-type.mjs';

expectType<Abs<0>, 0>('=');

expectType<Abs<-0>, 0>('=');

expectType<Abs<1>, 1>('=');

expectType<Abs<-1>, 1>('=');

expectType<Abs<2.3>, 2.3>('=');

expectType<Abs<-2.3>, 2.3>('=');

expectType<Abs<-3>, 3>('=');

expectType<Abs<-3 | 3>, 3>('=');

expectType<Abs<-1 | -2 | -3>, 1 | 2 | 3>('=');

// @ts-expect-error Abs does not accept string
expectType<Abs<'-0'>, 0>('=');

const _x = -1;

expectType<Abs<typeof _x>, 1>('=');
