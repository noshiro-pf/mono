import { type PartiallyNullable } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: number; b: string; c: boolean };
type PartiallyNullableData = PartiallyNullable<Data, 'a' | 'b'>;
// Result: { a: number | undefined; b: string | undefined; c: boolean }

// embed-sample-code-ignore-below
export type { Data, PartiallyNullableData };
