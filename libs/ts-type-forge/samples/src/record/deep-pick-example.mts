import { type DeepPick } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: { c: number; d: string } }; e: boolean };
type Picked = DeepPick<Data, ['a', 'b', 'c']>;
// Result: { a: { b: { c: number } } }

type Multi = DeepPick<Data, ['a', 'b', 'c'] | ['e']>;
// Result: { a: { b: { c: number } }; e: boolean }

// embed-sample-code-ignore-below
export type { Data, Multi, Picked };
