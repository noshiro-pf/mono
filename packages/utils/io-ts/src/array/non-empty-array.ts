import { IList } from '@noshiro/ts-utils';
import type { Type } from '../type';

export const nonEmptyArray = <A>({
  elementType,
  defaultValue,
}: Readonly<{
  elementType: Type<A>;
  defaultValue: NonEmptyArray<A>;
}>): Type<NonEmptyArray<A>> => {
  const is = (a: unknown): a is NonEmptyArray<A> =>
    IList.isArray(a) &&
    IList.isNonEmpty(a) &&
    IList.every(a, (e) => elementType.is(e));

  const fill = (a: unknown): NonEmptyArray<A> =>
    IList.isArray(a) && IList.isNonEmpty(a)
      ? IList.map(a, (e) => elementType.fill(e))
      : defaultValue;

  return { defaultValue, is, fill };
};
