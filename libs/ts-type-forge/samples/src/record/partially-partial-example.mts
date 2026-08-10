import { type PartiallyPartial } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = Readonly<{ a: number; b: string; c: boolean }>;
type PartiallyPartialData = PartiallyPartial<Data, 'a' | 'b'>;
// Result: { a?: number; b?: string; c: boolean }

// embed-sample-code-ignore-below
export type { Data, PartiallyPartialData };
