import type * as fsType from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Json, Result } from 'ts-data-forge';
import { getAllJsonFiles } from './get-all-json-files.mjs';
import { validateJsonObject } from './validator.mjs';

const thisDir = import.meta.dirname;

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

    // eslint-disable-next-line no-await-in-loop, security/detect-non-literal-fs-filename
    const contentString = await fs.readFile(srcFile, 'utf8');

    const content = Json.parse(contentString);

    if (Result.isErr(content)) {
      console.error(content.value);

      return;
    }

    if (!validateJsonObject(content.value, srcFile)) {
      throw new Error(
        `Validation error: (srcFile = "${srcFile}", content.value = "${JSON.stringify(content.value)}"`,
      );
    }
  }

  console.log('OK');
};

await main();
