import type { Type } from './type';

export const createCustomType = <A>(
  props: Readonly<{
    defaultValue: A;
    is: (value: unknown) => value is A;
    fill: (value: unknown) => A;
  }>
): Type<A> => props;
