import { type Tuple } from '../../src';
import { expectType } from '../expect-type';

expectType<Tuple.ButLast<readonly []>, readonly []>('=');
expectType<Tuple.ButLast<readonly [1]>, readonly []>('=');
expectType<Tuple.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>('=');
