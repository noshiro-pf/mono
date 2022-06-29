import { IList } from '@noshiro/ts-utils';
import type { Type, Typeof } from './type';

type MapTuple<T extends readonly Type<unknown>[]> = {
  readonly [K in keyof T]: Typeof<T[K]>;
};

export const tuple = <A extends readonly Type<unknown>[]>({
  types,
}: Readonly<{ types: A }>): Type<MapTuple<A>> => {
  const is = (a: unknown): a is MapTuple<A> =>
    IList.isArray(a) && types.every((t, i) => t.is(a[i]));

  const defaultValue = types.map((t) => t.defaultValue) as MapTuple<A>;

  const fill = (a: unknown): MapTuple<A> =>
    IList.isArray(a)
      ? (types.map((t, i) => t.fill(a[i])) as MapTuple<A>)
      : defaultValue;

  return {
    defaultValue,
    is,
    fill,
  };
};
