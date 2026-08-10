import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Z1 = Tuple.Zip<readonly [1, 2], readonly ['a', 'b']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
type Z2 = Tuple.Zip<readonly [1, 2, 3], readonly ['a', 'b']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
type Z3 = Tuple.Zip<readonly [1, 2], readonly ['a', 'b', 'c']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
type Z4 = Tuple.Zip<readonly [], readonly ['a']>; // readonly []

// embed-sample-code-ignore-below
export type { Z1, Z2, Z3, Z4 };
