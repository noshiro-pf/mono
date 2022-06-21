import { ISet } from '@noshiro/ts-utils';
import type { Type } from './type';

export const enumType = <A extends Primitive>({
  values,
  defaultValue,
}: Readonly<{ values: readonly A[]; defaultValue: A }>): Type<A> => {
  const valueSet = ISet.new(values);

  const is = (value: unknown): value is A =>
    (valueSet as ISet<unknown>).has(value);

  const fill = (value: unknown): A => (is(value) ? value : defaultValue);

  return { defaultValue, is, fill };
};
