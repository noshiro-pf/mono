import { type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.SkipLast<0, readonly []>, readonly []>('=');
expectType<ListType.SkipLast<1, readonly []>, readonly []>('=');
expectType<ListType.SkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');
expectType<ListType.SkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>('=');
expectType<ListType.SkipLast<5, readonly [1, 2, 3]>, readonly []>('=');
expectType<ListType.SkipLast<5, readonly number[]>, readonly number[]>('=');
