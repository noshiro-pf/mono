// One signature, even behind an optional annotation.
type Describe = (value: string | readonly string[]) => string;

export const describe: Describe = (value: string | readonly string[]): string =>
  typeof value === 'string' ? value : value.join(', ');

export const maybe: ((value: string) => string) | undefined = (
  value: string,
): string => value;

// An overload set is a `function` declaration; referring to one is not
// writing a function expression against it.
export function parse(value: number): number;
export function parse(value: string): string;
export function parse(value: number | string): number | string {
  return value;
}

type Parse = ((value: number) => number) & ((value: string) => string);

export const parseRef: Parse = parse;

// A callback's contextual type is the parameter of the signature the call
// resolved to: one signature.
export const lengths = ['a', 'bb'].map((s: string): number => s.length);
