import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type F1 = List.Flatten<[[1, 2], [3, 4]]>; // readonly [1, 2, 3, 4]
type F2 = List.Flatten<[readonly number[], readonly string[]]>; // readonly (string | number)[]
type F3 = List.Flatten<[[1], [2, [3]]]>; // readonly [1, 2, [3]] (only flattens one level)

// embed-sample-code-ignore-below
export type { F1, F2, F3 };
