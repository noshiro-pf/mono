import { type DeepRequired } from 'ts-type-forge';

// embed-sample-code-ignore-above

type PartialData = { a?: number; b?: { c?: string[] } };
type RequiredData = DeepRequired<PartialData>;
// Result: { a: number; b: { c: string[] } }

// embed-sample-code-ignore-below
export type { PartialData, RequiredData };
