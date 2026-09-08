export type Comparer = Readonly<{
  // @sumi-expect-error banned-syntax/no-method-shorthand
  compare(a: number, b: number): number;
}>;
