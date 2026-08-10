import { type DeepReadonly } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: number; b: { c: string[]; d: Map<number, boolean> } };
type ReadonlyData = DeepReadonly<Data>;
// Result: {
//   readonly a: number;
//   readonly b: {
//     readonly c: readonly string[];
//     readonly d: ReadonlyMap<number, boolean>;
//   };
// }

// embed-sample-code-ignore-below
export type { Data, ReadonlyData };
