import { type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.SetAt<readonly [], 2, 999>, readonly []>('=');
expectType<Tuple.SetAt<readonly [1, 2], 2, 999>, readonly [1, 2]>('=');
expectType<Tuple.SetAt<readonly [1, 2, 3], 1, 999>, readonly [1, 999, 3]>('=');
expectType<Tuple.SetAt<readonly [1, 2, 3], 0, 999>, readonly [999, 2, 3]>('=');
