// An overload set is read as one declaration; a statement between its
// signatures splits it in two for the reader, though not for the compiler.
// @sumi-expect-error functions/adjacent-overload-signatures
export function describe(value: string): string;
export const separator = ', ';
export function describe(value: readonly string[]): readonly string[];
export function describe(
  value: string | readonly string[],
): string | readonly string[] {
  return value;
}
