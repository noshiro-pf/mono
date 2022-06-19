import type { Type } from '../type';

export const createPrimitiveType = <A, D extends A>({
  defaultValue,
  is,
}: Readonly<{
  defaultValue: D;
  is: (value: unknown) => value is A;
}>): Type<A, D> => ({
  defaultValue,
  is,
  fill: (value: unknown): A => (is(value) ? value : defaultValue),
});
