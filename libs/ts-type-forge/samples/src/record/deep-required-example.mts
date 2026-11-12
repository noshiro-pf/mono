import { expectType } from 'ts-data-forge';
import type { DeepRequired } from 'ts-type-forge';

// embed-sample-code-ignore-above

type PartialData = { a?: number; b?: { c?: string[] } };
type RequiredData = DeepRequired<PartialData>;

expectType<
  RequiredData,
  // Result:
  { a: number; b: { c: string[] } }
>('=');

// embed-sample-code-ignore-below
export type { PartialData, RequiredData };
