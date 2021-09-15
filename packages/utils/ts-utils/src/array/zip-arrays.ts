import { IList } from '../immutable';

type Unwrap<S> = { [P in keyof S]: ArrayElement<S[P]> };

export function zipArrays<
  T extends [
    readonly unknown[],
    readonly unknown[],
    ...(readonly (readonly unknown[])[])
  ]
>(...arrays: T): Unwrap<T>[] {
  const len = IList.min(arrays.map(IList.size));
  if (len === undefined) return [];
  return IList.seqThrow(len).map((i) => arrays.map((a) => a[i])) as Unwrap<T>[];
}
