import { type UnknownResult } from 'ts-data-forge';

export const wrapStartEnd = async (
  fn: () => Promise<UnknownResult>,
  fnName: string,
): Promise<UnknownResult> => {
  console.info(`\nStart ${fnName}`);

  const res = await fn();

  console.info(`Done.\n`);

  return res;
};
