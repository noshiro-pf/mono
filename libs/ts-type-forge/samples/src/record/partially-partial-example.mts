import { expectType } from 'ts-data-forge';
import type { PartiallyPartial } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: number; b: string; c: boolean };
type PartiallyPartialData = PartiallyPartial<Data, 'a' | 'b'>;

expectType<
  PartiallyPartialData,
  // Result:
  { a?: number; b?: string; c: boolean }
>('=');

// embed-sample-code-ignore-below
export type { Data, PartiallyPartialData };
