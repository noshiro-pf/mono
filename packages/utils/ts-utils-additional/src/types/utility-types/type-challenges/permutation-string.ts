import { expectType } from '@noshiro/ts-utils';
import { type StringToUnion } from './string-to-union';

type PermutationStringImpl<U extends string, V extends U = U> = [U] extends [
  never,
]
  ? ''
  : V extends V
    ? `${V}${PermutationStringImpl<Exclude<U, V>>}`
    : never;

export type PermutationString<U extends string> = PermutationStringImpl<
  StringToUnion<U>
>;

expectType<
  PermutationString<'123'>,
  '123' | '132' | '213' | '231' | '312' | '321'
>('=');

expectType<PermutationString<'12'>, '12' | '21'>('=');
expectType<PermutationString<'1'>, '1'>('=');
expectType<PermutationString<''>, ''>('=');
