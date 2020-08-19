export const asyncFilter = async <T>(
  array: T[],
  asyncFn: <S>(a: T) => S
): Promise<T[]> => {
  const result = await Promise.all(array.map(asyncFn));
  return array.filter((_, i) => result[i]);
};
