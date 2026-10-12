// Clauses nothing at run time can tell apart: one body serves every call, so
// the set only refines the return type and is written as a single signature
// (D-58 judgement 1).

// Subtypes of each other: a `Named` is also a `Base`.
type Base = Readonly<{ id: number }>;
type Named = Readonly<{ id: number; name: string }>;

export function describeValue(value: Named): string;
// @sumi-expect-error functions/no-refinement-overload
export function describeValue(value: Base): number;
export function describeValue(value: Base): number | string {
  return value.id;
}

// A type-guard predicate and a boolean predicate are both just functions.
export function keep<A, B extends A>(
  pred: (a: A) => a is B,
  xs: readonly A[],
): readonly B[];
// @sumi-expect-error functions/no-refinement-overload
export function keep<A>(pred: (a: A) => boolean, xs: readonly A[]): readonly A[];
export function keep<A>(pred: (a: A) => boolean, xs: readonly A[]): readonly A[] {
  return xs.filter(pred);
}
