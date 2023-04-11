import { type UintRange } from '../src';
import { expectType } from './expect-type';

expectType<UintRange<0, 3>, 0 | 1 | 2>('=');
expectType<UintRange<0, 0>, never>('=');
expectType<UintRange<0, 1>, 0>('=');
expectType<UintRange<1.2, 3.4>, never>('=');
expectType<UintRange<0, 5>, 0 | 1 | 2 | 3 | 4>('=');
expectType<UintRange<2, 5>, 2 | 3 | 4>('=');

// large union type
expectType<UintRange<0, 100>, UintRange<0, 100>>('=');
