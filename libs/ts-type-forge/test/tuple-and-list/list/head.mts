import { expectType } from '../../expect-type.mjs';

expectType<List.Head<[]>, never>('=');
expectType<List.Head<number[]>, never>('=');
expectType<List.Head<[number, ...number[]], 0>, number>('=');
expectType<List.Head<number[], 1>, 1>('=');

expectType<List.Head<readonly []>, never>('=');
expectType<List.Head<readonly number[]>, never>('=');
expectType<List.Head<readonly [number, ...(readonly number[])], 0>, number>(
  '=',
);
expectType<List.Head<readonly number[], 1>, 1>('=');
