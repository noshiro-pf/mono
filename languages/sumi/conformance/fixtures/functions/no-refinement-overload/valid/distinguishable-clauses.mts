// Each pair of clauses is separated by something the body can test at run
// time, so each clause can have a body of its own (D-58 judgement 1).

// Arity: no argument count is accepted by both.
export function range(): readonly [];
export function range(end: number): readonly number[];
export function range(end?: number): readonly number[] {
  return Array.from({ length: end ?? 0 }, (_, i) => i);
}

// `typeof`: a string and a number never meet.
export function parse(value: number): number;
export function parse(value: string): string;
export function parse(value: number | string): number | string {
  return value;
}

// A tag: the discriminant's literal values do not overlap.
type Circle = Readonly<{ kind: 'circle'; radius: number }>;
type Square = Readonly<{ kind: 'square'; side: number }>;

export function shapeName(shape: Circle): 'circle';
export function shapeName(shape: Square): 'square';
export function shapeName(shape: Circle | Square): 'circle' | 'square' {
  return shape.kind;
}
