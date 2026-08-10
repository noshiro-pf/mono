import { type UnionToIntersection } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Inter = UnionToIntersection<Readonly<{ a: string } | { b: number }>>; // { a: string } & { b: number }

// embed-sample-code-ignore-below
export type { Inter };
