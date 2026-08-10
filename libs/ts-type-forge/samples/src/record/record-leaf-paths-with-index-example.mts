import { type RecordLeafPathsWithIndex } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: string[]; c: number } };
type LP = RecordLeafPathsWithIndex<Data>;
// LP = readonly ["a", "b", number] | readonly ["a", "c"]

// embed-sample-code-ignore-below
export type { Data, LP };
