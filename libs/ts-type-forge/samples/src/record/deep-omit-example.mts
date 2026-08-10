import { type DeepOmit } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: { c: number; d: string } }; e: boolean };
type Omitted = DeepOmit<Data, ['a', 'b', 'c']>;
// Result: { a: { b: { d: string } }; e: boolean }

type Multi = DeepOmit<Data, ['a', 'b'] | ['a', 'c']>;
// Result: { a: { d: boolean } }

// embed-sample-code-ignore-below
export type { Data, Multi, Omitted };
