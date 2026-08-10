import { type DeepOmit } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = Readonly<{
  a: Readonly<{ b: Readonly<{ c: number; d: string }> }>;
  e: boolean;
}>;
type Omitted = DeepOmit<Data, readonly ['a', 'b', 'c']>;
// Result: { a: { b: { d: string } }; e: boolean }

type Multi = DeepOmit<Data, readonly ['a', 'b'] | readonly ['a', 'c']>;
// Result: { a: { d: boolean } }

// embed-sample-code-ignore-below
export type { Data, Multi, Omitted };
