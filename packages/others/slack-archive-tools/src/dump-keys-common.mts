import { isRecord, Json, Result } from '@noshiro/ts-utils';
import type * as fsType from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';

export const fileContentValues = async (
  file: DeepReadonly<fsType.Dirent>,
): Promise<readonly UnknownRecord[]> => {
  const srcFile = path.resolve(file.parentPath, file.name);

  // console.log(srcFile);

  const contentString = await fs.readFile(srcFile, 'utf8');

  const content = Json.parse(contentString);

  if (Result.isErr(content)) {
    console.error(content.value);
    return [];
  }

  if (!Array.isArray(content.value)) {
    console.error('content is not array');
    console.log({ content, srcFile });
    return [];
  }

  const values: readonly unknown[] = content.value;

  if (!values.every(isRecord)) {
    console.error('content is not array');
    console.log({ values, srcFile });
    return [];
  }

  return values;
};
