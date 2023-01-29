import { type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.Take<2, readonly []>, readonly []>('=');
expectType<ListType.Take<2, readonly [1, 2]>, readonly [1, 2]>('=');
expectType<ListType.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>('=');
expectType<ListType.Take<0, readonly [1, 2, 3]>, readonly []>('=');
expectType<ListType.Take<2, readonly number[]>, readonly number[]>('=');
expectType<ListType.Take<0, readonly number[]>, readonly number[]>('=');
