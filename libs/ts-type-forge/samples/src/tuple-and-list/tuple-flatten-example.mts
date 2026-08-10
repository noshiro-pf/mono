import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type F1 = Tuple.Flatten<readonly [readonly [1, 2], readonly [3, 4]]>; // readonly [1, 2, 3, 4]
type F2 = Tuple.Flatten<readonly [readonly [1], readonly [2, 3]]>; // readonly [1, 2, 3]
type F3 = Tuple.Flatten<readonly [readonly [1], readonly [2, readonly [3]]]>; // readonly [1, 2, [3]] (only flattens one level)
type F4 = Tuple.Flatten<readonly [readonly number[], readonly string[]]>; // readonly (number | string)[]
type F5 = Tuple.Flatten<readonly (readonly number[])[]>; // readonly number[]

// embed-sample-code-ignore-below
export type { F1, F2, F3, F4, F5 };
