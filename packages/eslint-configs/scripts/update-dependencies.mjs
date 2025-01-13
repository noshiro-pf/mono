import { castMutable, isRecord } from '@noshiro/mono-utils';
import * as fs from 'node:fs/promises';

/**
 * @param {string | undefined} packageJsonPath
 * @param {string} targetJsonKey
 * @returns
 */
const main = async (packageJsonPath, targetJsonKey) => {
  if (packageJsonPath === undefined) return;

  const content = await fs.readFile(packageJsonPath, { encoding: 'utf8' });

  const parsed = JSON.parse(content) ?? {};

  if (!isRecord(parsed)) return;

  if (!Object.hasOwn(parsed, targetJsonKey)) return;

  const targetPath = castMutable(parsed[targetJsonKey]);

  if (!isRecord(targetPath)) return;

  for (const key of Object.keys(targetPath)) {
    const e = targetPath[key];
    if (typeof e !== 'string') continue;
    targetPath[key] = e.replaceAll(/^\^/gu, '');
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(parsed));
};

main(process.argv[2], process.argv[3] ?? 'dependencies').catch(console.error);
