import { type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.Reverse<readonly []>, readonly []>('=');
expectType<Tuple.Reverse<readonly [1]>, readonly [1]>('=');
expectType<Tuple.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>('=');
