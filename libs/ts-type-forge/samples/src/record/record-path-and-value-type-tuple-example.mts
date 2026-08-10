import { type RecordPathAndValueTypeTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = Readonly<{ a: string; b: readonly [number] }>;
type KPV = RecordPathAndValueTypeTuple<Data>;
// KPV = | readonly [readonly [], { a: string; b: [number] }]
//       | readonly [readonly ["a"], string]
//       | readonly [readonly ["b"], [number]]
//       | readonly [readonly ["b", 0], number]

// embed-sample-code-ignore-below
export type { Data, KPV };
