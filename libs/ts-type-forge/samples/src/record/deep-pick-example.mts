import { type DeepPick } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = Readonly<{
  a: Readonly<{ b: Readonly<{ c: number; d: string }> }>;
  e: boolean;
}>;
type Picked = DeepPick<Data, readonly ['a', 'b', 'c']>;
// Result: { a: { b: { c: number } } }

type Multi = DeepPick<Data, readonly ['a', 'b', 'c'] | readonly ['e']>;
// Result: { a: { b: { c: number } }; e: boolean }

// embed-sample-code-ignore-below
export type { Data, Multi, Picked };
