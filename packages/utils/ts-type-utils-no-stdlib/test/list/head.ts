import { type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.Head<[]>, never>('=');
expectType<ListType.Head<number[]>, never>('=');
expectType<ListType.Head<[number, ...number[]], 0>, number>('=');
expectType<ListType.Head<number[], 1>, 1>('=');

expectType<ListType.Head<readonly []>, never>('=');
expectType<ListType.Head<readonly number[]>, never>('=');
expectType<ListType.Head<readonly [number, ...(readonly number[])], 0>, number>(
  '=',
);
expectType<ListType.Head<readonly number[], 1>, 1>('=');
