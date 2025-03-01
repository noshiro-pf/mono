import 'zx/globals';

export const wrapStartEnd = async <T,>(
  fn: () => Promise<T>,
  fnName: string,
): Promise<T> => {
  echo(`\nStart ${fnName}`);

  const res = await fn();

  echo(`Done.\n`);

  return res;
};
