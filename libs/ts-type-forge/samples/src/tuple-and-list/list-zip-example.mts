import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Z1 = List.Zip<[1, 2], ['a', 'b']>; // readonly [[1, 'a'], [2, 'b']]
type Z2 = List.Zip<[1, 2, 3], ['a', 'b']>; // readonly [[1, 'a'], [2, 'b']]
type Z3 = List.Zip<readonly number[], readonly string[]>; // readonly (readonly [number, string])[]
type Z4 = List.Zip<[1, 2], readonly string[]>; // readonly [[1, string], [2, string]]
type Z5 = List.Zip<readonly number[], ['a', 'b']>; // readonly [[number, 'a'], [number, 'b']]

// embed-sample-code-ignore-below
export type { Z1, Z2, Z3, Z4, Z5 };
