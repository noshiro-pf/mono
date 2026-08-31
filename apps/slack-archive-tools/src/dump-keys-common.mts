import type * as fsType from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Json, Result } from 'ts-data-forge';
import { type DeepReadonly, type UnknownRecord } from 'ts-type-forge';

export const fileContentValues = async (
  file: DeepReadonly<fsType.Dirent>,
): Promise<readonly UnknownRecord[]> => {
  const srcFile = path.resolve(file.parentPath, file.name);

  // console.log(srcFile);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const contentString = await fs.readFile(srcFile, 'utf8');

  const content = Json.parse(contentString);

  if (Result.isErr(content)) {
    console.error(content.value);

    return [];
  }

  if (!Arr.isArray(content.value)) {
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
