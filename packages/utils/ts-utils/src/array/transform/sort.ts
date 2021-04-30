export const sort = <A>(compare: (a: A, b: A) => number) => <
  T extends readonly A[]
>(
  array: T
): { [K in keyof T]: T[number] } =>
  (array.slice().sort(compare) as unknown) as {
    [K in keyof T]: T[number];
  };
