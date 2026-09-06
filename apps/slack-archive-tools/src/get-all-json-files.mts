import type * as fsType from 'node:fs';
import * as fs from 'node:fs/promises';
import { ISet } from 'ts-data-forge';

const excludeList = ISet.create([
  'lists.json',
  'channels.json',
  'canvases.json',
  'integration_logs.json',
  'users.json',
] as const);

export const getAllJsonFiles = async (
  srcDir: string,
): Promise<readonly fsType.Dirent[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const allFiles: readonly fsType.Dirent[] = await fs.readdir(srcDir, {
    encoding: 'utf8',
    recursive: true,
    withFileTypes: true,
  });

  return allFiles.filter(
    (f) => f.isFile() && f.name.endsWith('json') && !excludeList.has(f.name),
  );
};
