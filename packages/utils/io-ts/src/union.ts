import type { Type, Typeof } from './type';

type MapUnion<T extends Type<unknown>> = T extends T ? Typeof<T> : never;

export const union = <A extends readonly Type<unknown>[]>({
  types,
  defaultType,
}: Readonly<{ types: A; defaultType: A[number] }>): Type<
  MapUnion<A[number]>
> => {
  const is = (value: unknown): value is MapUnion<A[number]> =>
    types.some((t) => t.is(value));

  const fill = (value: unknown): MapUnion<A[number]> =>
    is(value) ? value : (defaultType.fill(value) as MapUnion<A[number]>);

  return {
    defaultValue: defaultType.defaultValue as MapUnion<A[number]>,
    is,
    fill,
  };
};
