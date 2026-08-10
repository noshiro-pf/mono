import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Z1 = Tuple.Zip<[1, 2], ['a', 'b']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
type Z2 = Tuple.Zip<[1, 2, 3], ['a', 'b']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
type Z3 = Tuple.Zip<[1, 2], ['a', 'b', 'c']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
type Z4 = Tuple.Zip<[], ['a']>; // readonly []

// embed-sample-code-ignore-below
export type { Z1, Z2, Z3, Z4 };
