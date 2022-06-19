import type { Type, Typeof } from './type';

type MapUnion<T extends Type<unknown, unknown>> = T extends T
  ? Typeof<T>
  : never;

export const union = <
  A extends readonly Type<unknown, unknown>[],
  D extends A[number]
>({
  types,
  defaultType,
}: Readonly<{ types: A; defaultType: D }>): Type<
  MapUnion<A[number]>,
  MapUnion<D> extends MapUnion<A[number]> ? MapUnion<D> : never
> => {
  const is = (value: unknown): value is MapUnion<A[number]> =>
    types.some((t) => t.is(value));

  const fill = (value: unknown): MapUnion<A[number]> =>
    is(value) ? value : (defaultType.fill(value) as MapUnion<A[number]>);

  return {
    defaultValue: defaultType.defaultValue as MapUnion<D> extends MapUnion<
      A[number]
    >
      ? MapUnion<D>
      : never,
    is,
    fill,
  };
};
