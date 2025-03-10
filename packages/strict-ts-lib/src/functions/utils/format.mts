import { range } from '@noshiro/mono-utils';
import * as prettier from 'prettier';
import 'zx/globals';
import { paths } from '../../constants.mjs';
import {
  formatterOptionsDefault,
  formatterOptionsForCopied,
  formatWithPrintWidth320,
  ignoreFormatting,
} from '../formatter-config.mjs';

// NOTE: prettier CLI で実行するとき file path を複数の glob 文字列で与えることができず、
// glob で展開した絶対パスを渡しても長すぎてエラーになってしまったため、
// prettier.format API (https://prettier.io/docs/api) を直接呼ぶ実装に変更した。
// これに伴い strict-ts-lib workspace 用の .prettierrc ファイル等は削除した。

export const formatFiles = async (
  absolutePaths: readonly string[],
): Promise<'ok' | 'err'> => {
  for (const filePath of absolutePaths) {
    const src = await fs.readFile(filePath, { encoding: 'utf8' });

    const options = formatWithPrintWidth320(filePath)
      ? formatterOptionsForCopied
      : formatterOptionsDefault;

    const ignored = ignoreFormatting(filePath);

    if (ignored) {
      console.log(`${filePath} (ignored)`);
      continue;
    }

    const formatted = await prettier.format(src, {
      ...options,
      filepath: filePath,
    });

    console.log(
      `${filePath} (${src === formatted ? 'unchanged' : 'changed'}) ${options.printWidth === 80 ? '' : `(printWidth=${options.printWidth})`}`,
    );

    await fs.writeFile(filePath, formatted);
  }

  return 'ok';
};

export const formatChanged = async (
  times: SafeUintWithSmallInt = 5,
): Promise<'ok' | 'err'> => {
  cd(paths.monoRoot);
  for (const i of range(0, times)) {
    console.log(`format count: ${i}`);

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

    // console.log(JSON.stringify(statusParsed, undefined, 2));

    const files = statusParsed
      .filter(([t]) => t?.includes('D') !== true)
      .map((line) => line.at(-1))
      .filter((s) => s !== undefined)
      .filter((s) => !ignoreFormatting(s));

    if (files.length === 0) {
      return 'ok';
    }

    await formatFiles(files);
  }

  return 'ok';
};

export const formatDiffFromMain = async (
  times: SafeUintWithSmallInt = 5,
): Promise<'ok' | 'err'> => {
  cd(paths.monoRoot);
  for (const i of range(0, times)) {
    console.log(`format count: ${i}`);

    const res = await $`git diff ${['--name-only', 'main', '--diff-filter=d']}`;

    if (res.exitCode !== 0) {
      console.error(res);
      return 'err';
    }

    const files = res
      .text('utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .filter((s) => !ignoreFormatting(s));

    if (files.length === 0) {
      return 'ok';
    }

    await formatFiles(files);
  }

  return 'ok';
};
