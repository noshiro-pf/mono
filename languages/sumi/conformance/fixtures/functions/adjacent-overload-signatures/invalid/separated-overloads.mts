// An overload set is read as one declaration; a statement between its
// signatures splits it in two for the reader. With an implementation the
// compiler rejects the split as well (TS2391: a signature has to be followed
// by the next one or by the body); separated-declarations.mts is the case only
// the rule reports.
// @sumi-expect-error functions/adjacent-overload-signatures
// @sumi-expect-error compiler/2391
export function describe(value: string): string;
export const separator = ', ';
export function describe(value: readonly string[]): readonly string[];
export function describe(
  value: string | readonly string[],
): string | readonly string[] {
  return value;
}
