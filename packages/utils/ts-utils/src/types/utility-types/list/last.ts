import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ListHead } from './head';
import type { ListTail } from './tail';

export type ListLast<T extends readonly unknown[]> = T extends readonly []
  ? never
  : T extends readonly [unknown]
  ? ListHead<T>
  : ListLast<ListTail<T>>;

assertType<TypeEq<ListLast<[]>, never>>();
assertType<TypeEq<ListLast<[1]>, 1>>();
assertType<TypeEq<ListLast<[1, 2, 3]>, 3>>();

assertType<TypeEq<ListLast<readonly []>, never>>();
assertType<TypeEq<ListLast<readonly [1]>, 1>>();
assertType<TypeEq<ListLast<readonly [1, 2, 3]>, 3>>();
