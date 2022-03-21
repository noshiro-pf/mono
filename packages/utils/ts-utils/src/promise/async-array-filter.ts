export const asyncFilter = async <T>(
  array: readonly T[],
  asyncFn: <S>(a: T) => S
): Promise<readonly T[]> => {
  const result = await Promise.all(array.map(asyncFn));

  return array.filter((_, i) => result[i]);
};
