import * as fs from 'node:fs/promises';

export const makeEmptyDir = async (dir: string): Promise<void> => {
  await fs.rm(dir, { recursive: true, force: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(dir, { recursive: true });
};
