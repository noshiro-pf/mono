import { type DeepPartial } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = Readonly<{
  a: number;
  b: Readonly<{ c: readonly string[]; d: ReadonlyMap<number, boolean> }>;
}>;
type PartialData = DeepPartial<Data>;
// Result: {
//   a?: number;
//   b?: {
//     c?: (string | undefined)[] | undefined;
//     d?: ReadonlyMap<number | undefined, boolean | undefined> | undefined;
//   } | undefined;
// }

// embed-sample-code-ignore-below
export type { Data, PartialData };
