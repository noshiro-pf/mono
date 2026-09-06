export type Comparer = Readonly<{
  // @sumi-expect banned-syntax/no-method-shorthand
  compare(a: number, b: number): number;
}>;
