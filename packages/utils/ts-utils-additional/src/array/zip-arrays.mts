import { Arr } from '@noshiro/ts-utils';

type Unwrap<S> = { readonly [P in keyof S]: ArrayElement<S[P]> };

export function zipArrays<
  T extends readonly [
    readonly unknown[],
    readonly unknown[],
    ...(readonly (readonly unknown[])[]),
  ],
>(...arrays: T): readonly Unwrap<T>[] {
  const len = Arr.min(arrays.map(Arr.size));

  if (len === undefined) return [];

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Arr.seq(len).map((i) =>
    arrays.map((a) => a[i]),
  ) as readonly Unwrap<T>[];
}
