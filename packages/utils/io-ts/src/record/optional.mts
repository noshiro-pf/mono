import { type Type } from '../type.mjs';

export type OptionalPropertyType<T extends Type<unknown>> = T &
  PartiallyRequired<T, 'optional'>;

export const optional = <T extends Type<unknown>>(
  t: T,
): OptionalPropertyType<T> => ({
  ...t,
  optional: true,
});

export const isOptionalProperty = <T extends Type<unknown>>(
  t: T,
): t is OptionalPropertyType<T> =>
  Object.hasOwn(t, 'optional') && t.optional === true;
