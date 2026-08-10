import { type Intersection } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Inter = Intersection<readonly [string, number, Readonly<{ a: boolean }>]>; // string & number & { a: boolean }

// embed-sample-code-ignore-below
export type { Inter };
