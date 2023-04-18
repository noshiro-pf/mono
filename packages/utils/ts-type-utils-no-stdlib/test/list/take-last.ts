import { type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.TakeLast<2, readonly []>, readonly []>('=');
expectType<ListType.TakeLast<2, readonly [1, 2]>, readonly [1, 2]>('=');
expectType<ListType.TakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>('=');
expectType<ListType.TakeLast<0, readonly [1, 2, 3]>, readonly []>('=');
expectType<ListType.TakeLast<2, readonly number[]>, readonly number[]>('=');
expectType<ListType.TakeLast<0, readonly number[]>, readonly number[]>('=');
