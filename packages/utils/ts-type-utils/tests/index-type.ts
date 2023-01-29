import { type Index } from '../src';
import { expectType } from './expect-type';

expectType<Index<3>, 0 | 1 | 2>('=');
expectType<Index<0>, never>('=');
expectType<Index<1.2>, never>('=');
expectType<Index<5>, 0 | 1 | 2 | 3 | 4>('=');
