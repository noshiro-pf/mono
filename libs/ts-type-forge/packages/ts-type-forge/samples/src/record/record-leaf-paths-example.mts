import { type RecordLeafPaths } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: [string, { d: boolean }]; c: number } };
type LP = RecordLeafPaths<Data>;
// LP = readonly ["a", "b", 0] | readonly ["a", "b", 1, "d"] | readonly ["a", "c"]

// embed-sample-code-ignore-below
export type { Data, LP };
