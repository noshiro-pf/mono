import type { Type } from '../type';

export const createPrimitiveType = <A>({
  defaultValue,
  is,
}: Readonly<{
  defaultValue: A;
  is: (value: unknown) => value is A;
}>): Type<A> => ({
  defaultValue,
  is,
  fill: (value: unknown): A => (is(value) ? value : defaultValue),
});
