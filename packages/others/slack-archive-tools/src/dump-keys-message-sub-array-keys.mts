/* eslint-disable no-restricted-globals */
import { toThisDir } from '@noshiro/mono-utils';
import { ISet, isRecord } from '@noshiro/ts-utils';
import type * as fsType from 'node:fs';
import 'zx/globals';
import { fileContentValues } from './dump-keys-common.mjs';
import { getAllJsonFiles } from './get-all-json-files.mjs';

const dumpMessageSubArrayKeys = async (pathKey: string): Promise<void> => {
  const thisDir = toThisDir(import.meta.url);
  const rootDir = path.resolve(thisDir, '..');

  const srcDir = path.resolve(
    rootDir,
    'archive',
    'Slack_export_Sep_23_2020_-_Aug_24_2024',
  );

  const distDir = path.resolve(rootDir, 'archive', 'dump');

  const outFilename = `key-patterns-${pathKey}-array-element`;
  const outFilePath = path.resolve(distDir, `./${outFilename}.json`);

  const jsonFiles: readonly fsType.Dirent[] = await getAllJsonFiles(srcDir);

  await fs.mkdir(distDir, { recursive: true });

  const keyPatternsAsString = new Set<string>([]);

  const keys = new Map<string, boolean>([]);

  for (const file of jsonFiles) {
    const values = await fileContentValues(file);

    for (const c of values) {
      if (Object.hasOwn(c, pathKey)) {
        const arr = c[pathKey];
        if (Array.isArray(arr)) {
          for (const o of arr) {
            if (isRecord(o)) {
              const ks = Object.keys(o);

              for (const k of ks) {
                keys.set(k, true);
              }

              keyPatternsAsString.add(ks.join(','));
            }
          }
        }
      }
    }
  }

  const keyPatternsCheck = new Set<string>();

  for (const ks of keyPatternsAsString.values()) {
    const keyPattern: ReadonlySet<string> = new Set<string>(ks.split(','));

    for (const s of keyPattern.values()) {
      keyPatternsCheck.add(s);
    }

    for (const key of keys.keys()) {
      if (!keyPattern.has(key)) {
        keys.set(key, false);
      }
    }
  }

  console.log(
    outFilename,
    ISet.equal<string>(ISet.new(keyPatternsCheck), ISet.new(keys.keys())),
  );

  await fs.writeFile(
    outFilePath,

    JSON.stringify(
      Object.fromEntries(
        Array.from(keys.entries()).toSorted(([key1], [key2]) =>
          key1.localeCompare(key2),
        ),
      ),
      undefined,
      2,
    ),
  );
};

const main = async (): Promise<void> => {
  await Promise.all([
    dumpMessageSubArrayKeys('attachments'),
    dumpMessageSubArrayKeys('blocks'),
    dumpMessageSubArrayKeys('x_files'),
    dumpMessageSubArrayKeys('files'),
  ]);
};

main().catch(() => {});
