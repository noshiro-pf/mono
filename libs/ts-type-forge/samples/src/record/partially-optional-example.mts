import { type PartiallyOptional } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: number; b: string; c: boolean };
type PartiallyOptionalData = PartiallyOptional<Data, 'a' | 'b'>;
// Result: { a?: number; b?: string; c: boolean }

// embed-sample-code-ignore-below
export type { Data, PartiallyOptionalData };
