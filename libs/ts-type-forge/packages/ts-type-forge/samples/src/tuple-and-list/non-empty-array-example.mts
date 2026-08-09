import { type NonEmptyArray } from 'ts-type-forge';

// embed-sample-code-ignore-above

type NA = NonEmptyArray<number>; // MinLengthArray<1, number>
const head = (arr: NA): number => arr[0]; // OK — no `undefined`

// embed-sample-code-ignore-below
export { head };
export type { NA };
