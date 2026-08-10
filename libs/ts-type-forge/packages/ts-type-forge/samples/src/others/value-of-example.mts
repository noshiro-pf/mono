import { type ValueOf } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Values = ValueOf<{ a: string; b: number }>; // string | number

// embed-sample-code-ignore-below
export type { Values };
