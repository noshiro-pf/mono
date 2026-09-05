import type * as fsType from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ISet } from 'ts-data-forge';
import { fileContentValues } from './dump-keys-common.mjs';
import { getAllJsonFiles } from './get-all-json-files.mjs';

const thisDir = import.meta.dirname;

const rootDir = path.resolve(thisDir, '..');

const srcDir = path.resolve(
  rootDir,
  'archive',
  'Slack_export_Sep_23_2020_-_Aug_24_2024',
);

const distDir = path.resolve(rootDir, 'archive', 'dump');

const outFilename = 'message-key-patterns';

const outFilePath = path.resolve(distDir, `./${outFilename}.json`);

const main = async (): Promise<void> => {
  const jsonFiles: readonly fsType.Dirent[] = await getAllJsonFiles(srcDir);

  // await fs.rm(distDir, { recursive: true, force: true });

  await fs.mkdir(distDir, { recursive: true });

  const mut_keyPatternsAsString = new Set<string>();

  const mut_keys = new Map<string, boolean>();

  for (const file of jsonFiles) {
    // eslint-disable-next-line no-await-in-loop
    const values = await fileContentValues(file);

    for (const c of values) {
      const ks = Object.keys(c);

      for (const k of ks) {
        mut_keys.set(k, true);
      }

      mut_keyPatternsAsString.add(ks.join(','));
    }
  }

  const mut_keyPatternsCheck = new Set<string>();

  for (const ks of mut_keyPatternsAsString) {
    const keyPattern: ReadonlySet<string> = new Set<string>(ks.split(','));

    for (const s of keyPattern) {
      mut_keyPatternsCheck.add(s);
    }

    for (const key of mut_keys.keys()) {
      if (!keyPattern.has(key)) {
        mut_keys.set(key, false);
      }
    }
  }

  console.log(
    outFilename,
    ISet.equal<string>(
      ISet.create(mut_keyPatternsCheck),
      ISet.create(mut_keys.keys()),
    ),
  );

  await fs.writeFile(
    outFilePath,

    JSON.stringify(
      Object.fromEntries(
        Array.from(mut_keys).toSorted(([key1], [key2]) =>
          key1.localeCompare(key2),
        ),
      ),
      undefined,
      2,
    ),
  );
};

await main();
