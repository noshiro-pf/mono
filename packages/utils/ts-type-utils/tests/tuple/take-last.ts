import { type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.TakeLast<2, readonly []>, readonly []>('=');
expectType<Tuple.TakeLast<2, readonly [1, 2]>, readonly [1, 2]>('=');
expectType<Tuple.TakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>('=');
expectType<Tuple.TakeLast<0, readonly [1, 2, 3]>, readonly []>('=');
