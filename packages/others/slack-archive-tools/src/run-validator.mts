import { toThisDir } from '@noshiro/node-utils';
import { Json, Result } from '@noshiro/ts-utils';
import type * as fsType from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { getAllJsonFiles } from './get-all-json-files.mjs';
import { validateJsonObject } from './validator.mjs';

const thisDir = toThisDir(import.meta.url);
const rootDir = path.resolve(thisDir, '..');

const srcDir = path.resolve(
  rootDir,
  'archive',
  'Slack_export_Sep_23_2020_-_Aug_24_2024',
);

export const main = async (): Promise<void> => {
  const jsonFiles: readonly fsType.Dirent[] = await getAllJsonFiles(srcDir);

  for (const file of jsonFiles) {
    const srcFile = path.resolve(file.parentPath, file.name);

    const contentString = await fs.readFile(srcFile, 'utf8');

    const content = Json.parse(contentString);

    if (Result.isErr(content)) {
      console.error(content.value);
      return;
    }

    if (!validateJsonObject(content.value, srcFile)) {
      throw new Error(
        // eslint-disable-next-line no-restricted-globals
        `Validation error: (srcFile = "${srcFile}", content.value = "${JSON.stringify(content.value)}"`,
      );
    }
  }
  console.log('OK');
};

await main();
