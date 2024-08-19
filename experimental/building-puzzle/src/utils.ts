export const createArrLen6 = <T>(
  fn: (i: Index<6>) => T,
): MutableArrayOfLength<6, T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Array.from({ length: 6 }, (_, i) =>
    fn(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      i as Index<6>,
    ),
  ) as unknown as MutableArrayOfLength<6, T>;
