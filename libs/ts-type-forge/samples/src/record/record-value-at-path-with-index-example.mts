import { type RecordValueAtPathWithIndex } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: string[]; c: number } };
type V1 = RecordValueAtPathWithIndex<Data, ['a', 'b', number]>; // string | undefined
type V2 = RecordValueAtPathWithIndex<Data, ['a', 'c']>; // number
type V3 = RecordValueAtPathWithIndex<Data, []>; // { a: { b: string[]; c: number } }

// embed-sample-code-ignore-below
export type { Data, V1, V2, V3 };
