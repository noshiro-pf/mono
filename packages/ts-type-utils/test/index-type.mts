import { expectType } from './expect-type.mjs';

expectType<Index<3>, 0 | 1 | 2>('=');
expectType<Index<0>, never>('=');
expectType<Index<1.2>, never>('=');
expectType<Index<5>, 0 | 1 | 2 | 3 | 4>('=');

expectType<NegativeIndex<5>, -1 | -2 | -3 | -4 | -5>('=');
expectType<NegativeIndex<5.3>, never>('=');
expectType<NegativeIndex<-5.1>, never>('=');
expectType<NegativeIndex<0>, never>('=');
