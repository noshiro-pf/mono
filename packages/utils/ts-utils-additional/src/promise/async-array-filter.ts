export const asyncFilter = async <T>(
  array: readonly T[],
  asyncFn: (a: T) => Promise<boolean>,
): Promise<readonly T[]> => {
  const result = await Promise.all(array.map(asyncFn));

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return array.filter((_, i) => result[i]!);
};
