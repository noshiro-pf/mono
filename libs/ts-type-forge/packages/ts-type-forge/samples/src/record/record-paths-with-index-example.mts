import { type RecordPathsWithIndex } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: string[]; c: number } };
type P = RecordPathsWithIndex<Data>;
// P = readonly [] | readonly ["a"] | readonly ["a", "b"] | readonly ["a", "b", number] | readonly ["a", "c"]

// embed-sample-code-ignore-below
export type { Data, P };
