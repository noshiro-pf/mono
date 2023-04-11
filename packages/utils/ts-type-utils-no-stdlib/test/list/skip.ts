import { type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.Skip<0, readonly []>, readonly []>('=');
expectType<ListType.Skip<1, readonly []>, readonly []>('=');
expectType<ListType.Skip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<ListType.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>('=');
expectType<ListType.Skip<5, readonly [1, 2, 3]>, readonly []>('=');
expectType<ListType.Skip<5, readonly number[]>, readonly number[]>('=');
