export const arrow = (): number => 1;

// A declaration is allowed when it carries overload signatures (D-13).
export function parse(value: number): number;
export function parse(value: string): string;
export function parse(value: number | string): number | string {
  return value;
}

// Generators have no arrow form (D-18).
export function* count(): Generator<number> {
  yield 1;
}
