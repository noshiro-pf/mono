import { assertType } from '@noshiro/ts-utils';
import type { StringToUnion } from './string-to-union';

type PermutationStringImpl<U extends string, V extends U = U> = [U] extends [
  never
]
  ? ''
  : V extends V
  ? `${V}${PermutationStringImpl<StrictExclude<U, V>>}`
  : never;

export type PermutationString<U extends string> = PermutationStringImpl<
  StringToUnion<U>
>;

assertType<
  TypeEq<
    PermutationString<'123'>,
    '123' | '132' | '213' | '231' | '312' | '321'
  >
>();

assertType<TypeEq<PermutationString<'12'>, '12' | '21'>>();
assertType<TypeEq<PermutationString<'1'>, '1'>>();
assertType<TypeEq<PermutationString<''>, ''>>();
