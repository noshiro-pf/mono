import { expectType } from 'ts-data-forge';
import type { DeepPartial } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: number; b: { c: string[]; d: Map<number, { e: string }> } };
type PartialData = DeepPartial<Data>;

expectType<
  PartialData,
  // Result:
  {
    a?: number;
    b?: {
      c?: (string | undefined)[];
      d?: Map<number, { e?: string }>;
    };
  }
>('=');

// embed-sample-code-ignore-below
export type { Data, PartialData };
