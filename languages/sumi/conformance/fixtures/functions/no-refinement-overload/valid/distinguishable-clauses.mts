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

// A tag on an options object that may be left out: `typeof` separates the
// absent case and the tag the rest, which is the check the body makes.
type StrictOptions = Readonly<{ loose?: false }>;
type LooseOptions = Readonly<{ loose: true }>;

export function choose(value: string, options?: StrictOptions): 'strict';
export function choose(value: string, options: LooseOptions): 'loose';
export function choose(
  value: string,
  options?: StrictOptions | LooseOptions,
): 'strict' | 'loose' {
  return options?.loose === true || value.length === 0 ? 'loose' : 'strict';
}
