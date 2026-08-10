import { type PartiallyRequired } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a?: number; b?: string; c?: boolean };
type PartiallyRequiredData = PartiallyRequired<Data, 'a' | 'b'>;
// Result: { a: number; b: string; c?: boolean }

// embed-sample-code-ignore-below
export type { Data, PartiallyRequiredData };
