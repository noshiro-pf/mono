import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type M1 = Tuple.MapTo<boolean, [1, 'a']>; // readonly [boolean, boolean]
type M2 = Tuple.MapTo<string, readonly number[]>; // readonly string[]
type M3 = Tuple.MapTo<string, readonly []>; // readonly []
type M4 = Tuple.MapTo<string, readonly [1, 2?]>; // readonly [string, (string | undefined)?]
type M5 = Tuple.MapTo<string, readonly [1, ...(readonly 2[])]>; // readonly [string, ...(readonly string[])]

// The usual reason to reach for it: naming the shape of a mapped result
// inside a function that is itself generic over the tuple.
declare const wrapAll: <T extends readonly unknown[]>(
  values: T,
) => Tuple.MapTo<T[number] | undefined, T>;

// embed-sample-code-ignore-below
export { wrapAll };
export type { M1, M2, M3, M4, M5 };
