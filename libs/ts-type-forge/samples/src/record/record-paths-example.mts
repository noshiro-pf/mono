import { type RecordPaths } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = Readonly<{
  a: Readonly<{ b: readonly [string, boolean]; c: number }>;
}>;
type P = RecordPaths<Data>;
// P = readonly [] | readonly ["a"] | readonly ["a", "b"] | readonly ["a", "b", 0] | readonly ["a", "b", 1] | readonly ["a", "c"]

// embed-sample-code-ignore-below
export type { Data, P };
