import { type DeepMutable } from 'ts-type-forge';

// embed-sample-code-ignore-above

type ReadonlyData = Readonly<{ a: number; b: { c: readonly string[] } }>;
type MutableData = DeepMutable<ReadonlyData>;
// Result: { a: number; b: { c: string[] } }

// embed-sample-code-ignore-below
export type { MutableData, ReadonlyData };
