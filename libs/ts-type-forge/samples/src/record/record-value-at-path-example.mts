import { type RecordValueAtPath } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: [string, boolean] } };
type V1 = RecordValueAtPath<Data, ['a', 'b', 0]>; // string
type V2 = RecordValueAtPath<Data, ['a']>; // { b: [string, boolean] }
type V3 = RecordValueAtPath<Data, []>; // { a: { b: [string, boolean] } }

// embed-sample-code-ignore-below
export type { Data, V1, V2, V3 };
