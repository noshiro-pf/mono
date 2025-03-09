import { range } from '@noshiro/mono-utils';
import 'zx/globals';
import { paths } from '../constants.mjs';

export const formatFiles = async (
  absolutePaths: string | readonly string[],
): Promise<'ok' | 'err'> => {
  cd(paths.strictTsLib.source.$);
  const res =
    await $`yarn zz:prettier ${Array.isArray(absolutePaths) ? absolutePaths.join(' ') : absolutePaths}`;
  if (res.exitCode !== 0) {
    console.error(res);
    return 'err';
  }

  return 'ok';
};

export const formatChanged = async (
  times: SafeUintWithSmallInt = 5,
): Promise<'ok' | 'err'> => {
  cd(paths.root);
  for (const i of range(0, times)) {
    console.log(i);

    const res = await $`git status ${['--short', '--porcelain']}`;

    if (res.exitCode !== 0) {
      console.error(res);
      return 'err';
    }

    const statusParsed = res
      .text('utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map((line) => line.split(' ').filter((s) => s !== ''));

    console.log(JSON.stringify(statusParsed, undefined, 2));

    const files = statusParsed
      .filter(([t]) => t?.includes('D') !== true)
      .map((line) => line.at(-1));

    console.log('target files:', JSON.stringify(files, undefined, 2));

    if (files.length === 0) {
      return 'ok';
    }

    const result = await $`prettier ${[
      '--write',
      '--ignore-path',
      'packages/strict-ts-lib/.prettierignore',
      '--ignore-unknown',
    ]} ${files}`;

    if (result.exitCode !== 0) {
      console.error(result);
      return 'err';
    }
  }

  return 'ok';
};

export const formatDiffFromMain = async (
  times: SafeUintWithSmallInt = 5,
): Promise<'ok' | 'err'> => {
  cd(paths.root);
  for (const i of range(0, times)) {
    console.log(i);

    const res = await $`git diff ${['--name-only', 'main', '--diff-filter=d']}`;

    if (res.exitCode !== 0) {
      console.error(res);
      return 'err';
    }

    const files = res
      .text('utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s !== '');

    console.log('target files:', JSON.stringify(files, undefined, 2));

    if (files.length === 0) {
      return 'ok';
    }
    {
      const res2 = await $`prettier ${[
        '--write',
        '--ignore-path',
        'packages/strict-ts-lib/.prettierignore',
        '--ignore-unknown',
      ]} ${files}`;

      if (res2.exitCode !== 0) {
        console.error(res2);
        return 'err';
      }
    }
  }

  return 'ok';
};
