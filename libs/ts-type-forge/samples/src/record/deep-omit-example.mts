import { expectType } from 'ts-data-forge';
import type { DeepOmit } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: { c: number; d: string } }; e: boolean };
type Omitted = DeepOmit<Data, ['a', 'b', 'c']>;

expectType<
  Omitted,
  // Result:
  { a: { b: { d: string } }; e: boolean }
>('=');

type Multi = DeepOmit<Data, ['a', 'b', 'c'] | ['e']>;

expectType<
  Multi,
  // Result:
  { a: { b: { d: string } } }
>('=');

// embed-sample-code-ignore-below
export type { Data, Multi, Omitted };
