import { ISet } from '@noshiro/ts-utils';
import type * as fsType from 'node:fs';
import * as fs from 'node:fs/promises';

const excludeList = ISet.new([
  'lists.json',
  'channels.json',
  'canvases.json',
  'integration_logs.json',
  'users.json',
] as const);

export const getAllJsonFiles = async (
  srcDir: string,
): Promise<readonly fsType.Dirent[]> => {
  const allFiles: readonly fsType.Dirent[] = await fs.readdir(srcDir, {
    encoding: 'utf8',
    recursive: true,
    withFileTypes: true,
  });

  return allFiles.filter(
    (f) => f.isFile() && f.name.endsWith('json') && !excludeList.has(f.name),
  );
};
