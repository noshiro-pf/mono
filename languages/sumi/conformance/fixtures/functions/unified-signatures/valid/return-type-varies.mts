// The return type follows the argument's type, which no single signature
// without a conditional type can state.
export function parse(value: number): number;
export function parse(value: string): string;
export function parse(value: number | string): number | string {
  return value;
}

export const label = (value: number | string): string => `${value}`;
