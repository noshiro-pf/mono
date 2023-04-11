import { type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.SkipLast<0, readonly []>, readonly []>('=');
expectType<Tuple.SkipLast<1, readonly []>, readonly []>('=');
expectType<Tuple.SkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<Tuple.SkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>('=');
expectType<Tuple.SkipLast<5, readonly [1, 2, 3]>, readonly []>('=');
