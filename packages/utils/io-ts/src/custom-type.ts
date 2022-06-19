import type { Type } from './type';

export const createCustomType = <A, D extends A>(
  props: Readonly<{
    defaultValue: D;
    is: (value: unknown) => value is A;
    fill: (value: unknown) => A;
  }>
): Type<A, D> => props;
