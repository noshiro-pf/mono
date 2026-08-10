import { type RecordValueAtPathWithIndex } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = Readonly<{ a: Readonly<{ b: readonly string[]; c: number }> }>;
type V1 = RecordValueAtPathWithIndex<Data, readonly ['a', 'b', number]>; // string | undefined
type V2 = RecordValueAtPathWithIndex<Data, readonly ['a', 'c']>; // number
type V3 = RecordValueAtPathWithIndex<Data, readonly []>; // { a: { b: string[]; c: number } }

// embed-sample-code-ignore-below
export type { Data, V1, V2, V3 };
