export type Comparer = Readonly<{
  // @tsubu-expect banned-syntax/no-method-shorthand
  compare(a: number, b: number): number;
}>;
