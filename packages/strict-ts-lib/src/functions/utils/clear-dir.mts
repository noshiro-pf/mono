import 'zx/globals';

export const clearDir = async (dir: string): Promise<'ok' | 'err'> => {
  await $`rm -rf ${dir}`;
  await $`mkdir -p ${dir}`;
  return 'ok';
};
