export const separator = ', ';

export function describe(value: string): string;
export function describe(value: readonly string[]): readonly string[];
export function describe(
  value: string | readonly string[],
): string | readonly string[] {
  return value;
}
