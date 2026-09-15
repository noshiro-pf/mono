// Overloads a single signature says just as well: they return the same type,
// so one signature taking the union (or an optional parameter) accepts every
// call they accept and returns no less precisely (D-58: a refinement is a
// single signature).
export function label(value: string): string;
// @sumi-expect-error functions/unified-signatures
export function label(value: number): string;
export function label(value: number | string): string {
  return `${value}`;
}

export function pad(value: string): string;
// @sumi-expect-error functions/unified-signatures
export function pad(value: string, width: number): string;
export function pad(value: string, width?: number): string {
  return value.padStart(width ?? 0);
}
