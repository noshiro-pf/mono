import { type MergeIntersection } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Merged = MergeIntersection<{ a: string } & { b: number }>; // { a: string; b: number }

// embed-sample-code-ignore-below
export type { Merged };
