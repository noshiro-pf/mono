import type * as fsType from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { hasKey, ISet, isRecord } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import { fileContentValues } from './dump-keys-common.mjs';
import { getAllJsonFiles } from './get-all-json-files.mjs';

/**
 * Records the keys of `c[pathKey]` for every entry in `values`.
 *
 * Extracted from the loop over files rather than written inline, because
 * `unicorn/no-break-in-nested-loop` rejects `continue` inside a nested loop
 * while `unicorn/prefer-continue` rejects wrapping the body in an `if` —
 * which is exactly what the first rule's message suggests doing about it.
 */
const collectSubKeys = (
  values: readonly UnknownRecord[],
  pathKey: string,
  mut_keys: Map<string, boolean>,
  mut_keyPatternsAsString: Set<string>,
): void => {
  for (const c of values) {
    if (!hasKey(c, pathKey)) continue;

    const o = c[pathKey];

    if (!isRecord(o)) continue;

    const ks = Object.keys(o);

    for (const k of ks) {
      mut_keys.set(k, true);
    }

    mut_keyPatternsAsString.add(ks.join(','));
  }
};

const dumpMessageSubKeys = async (pathKey: string): Promise<void> => {
  const thisDir = import.meta.dirname;

  const rootDir = path.resolve(thisDir, '..');

  const srcDir = path.resolve(
    rootDir,
    'archive',
    'Slack_export_Sep_23_2020_-_Aug_24_2024',
  );

  const distDir = path.resolve(rootDir, 'archive', 'dump');

  const outFilename = `key-patterns-${pathKey}` as const;

  const outFilePath = path.resolve(distDir, `./${outFilename}.json`);

  const jsonFiles: readonly fsType.Dirent[] = await getAllJsonFiles(srcDir);

  await fs.mkdir(distDir, { recursive: true });

  const mut_keyPatternsAsString = new Set<string>();

  const mut_keys = new Map<string, boolean>();

  for (const file of jsonFiles) {
    // eslint-disable-next-line no-await-in-loop
    const values = await fileContentValues(file);

    collectSubKeys(values, pathKey, mut_keys, mut_keyPatternsAsString);
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

  // eslint-disable-next-line security/detect-non-literal-fs-filename
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

const main = async (): Promise<void> => {
  await Promise.all([
    dumpMessageSubKeys('user_profile'),
    dumpMessageSubKeys('root'),
    dumpMessageSubKeys('bot_profile'),
  ]);
};

await main();
