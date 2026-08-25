#!/usr/bin/env tsx

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import { $, glob, isDirectlyExecuted } from 'ts-repo-utils';
import { type NonEmptyArray } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import {
  applyTransformationsToFile,
  applyTypeTransformations,
} from './apply-codemod.mjs';
import { eslintPlugins } from './constants/eslint-plugins.mjs';
import { tsTypeForgeImportStatement } from './constants/ts-type-forge-import.mjs';
import { generateRulesTypeCore } from './functions/generate-rules-type-core.mjs';

const thisDir = import.meta.dirname;

const TYPES_RULES_DIR = path.resolve(projectRootPath, 'src/types/rules');

const eslintConfigPath = path.resolve(thisDir, './eslint.config.gen.mts');

export const generateRulesType = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<void> => {
  {
    const result = await generate(targetFileNames);

    if (result.type === 'error') {
      console.error(result.error);

      return;
    }
  }

  {
    console.info('running codemod...');

    await applyTypeTransformationsForTargets(targetFileNames);

    await fmt(targetFileNames);
  }

  {
    console.info('running `lint --fix` ...');

    // `eslint --fix` exits non-zero whenever any problem is left unfixed, which
    // is not a reason to abort: the formatting below still has to run, or the
    // generated files are left in a half-formatted state.
    const result = await lintFix(targetFileNames);

    if (result.type === 'error') {
      console.warn('`lint --fix` reported problems:');

      console.warn(result.error);
    }

    // `eslint --fix` can introduce new usages of ts-type-forge types, so the
    // import has to be restored before organize-imports prunes it for the last
    // time.
    await restoreTsTypeForgeImport(targetFileNames);

    await fmt(targetFileNames);
  }

  {
    // `@typescript-eslint/consistent-indexed-object-style` rewrites index
    // signatures into the built-in `Record` during `eslint --fix`, which
    // re-introduces `Readonly<Record<...>>` after the codemod above has
    // already run. Run the codemod once more so the generated files end up in
    // the codemod's record style (`ReadonlyRecord`) and regeneration stays a
    // fixed point of `codemod:full`.
    console.info('running codemod (post `lint --fix`)...');

    await applyTypeTransformationsForTargets(targetFileNames);

    // The codemod can introduce ts-type-forge type usages of its own (e.g.
    // `ReadonlyRecord`), so restore the import again before organize-imports
    // prunes it for the last time.
    await restoreTsTypeForgeImport(targetFileNames);

    await fmt(targetFileNames);
  }
};

/** 生成ファイルの ts-type-forge の import 文を、全型を含む形に戻す */
const restoreTsTypeForgeImport = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<void> => {
  const globResult = await glob(`${TYPES_RULES_DIR}/*.mts`);

  if (Result.isErr(globResult)) {
    console.error(globResult.value);

    return;
  }

  const targetFiles = filterTargetFiles(globResult.value, targetFileNames);

  for (const filePath of targetFiles) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await fs.readFile(filePath, 'utf8');

    if (content.includes(tsTypeForgeImportStatement)) {
      continue;
    }

    const replaced = tsTypeForgeImportPattern.test(content)
      ? content.replace(tsTypeForgeImportPattern, tsTypeForgeImportStatement)
      : content.replace(
          eslintImportPattern,
          (matched) => `${matched}\n${tsTypeForgeImportStatement}`,
        );

    if (replaced !== content) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(filePath, replaced);
    }
  }
};

/** 既存の ts-type-forge の import 文（prettier により複数行になりうる） */
const tsTypeForgeImportPattern =
  /import\s*\{[^}]*\}\s*from\s*'ts-type-forge';/u;

/** ts-type-forge の import 文を挿入する位置の目印 */
const eslintImportPattern = /import\s*\{[^}]*\}\s*from\s*'eslint';/u;

const fmt = async (targetFileNames?: NonEmptyArray<string>): Promise<void> => {
  console.info('formatting code ...');

  const targetPattern =
    targetFileNames === undefined
      ? 'src/types/rules/*.mts'
      : targetFileNames.map((name) => `src/types/rules/${name}`).join(' ');

  const result = await $(`pnpm exec prettier --write ${targetPattern}`);

  if (Result.isErr(result)) {
    console.error(result.value);
  }
};

const generate = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>> => {
  const plugins = Object.values(eslintPlugins);

  const targetPlugins =
    targetFileNames === undefined
      ? plugins
      : plugins.filter((plugin) =>
          targetFileNames.includes(plugin.outputFileName),
        );

  for (const plugin of targetPlugins) {
    console.info(`generating ${plugin.outputFileName} ...`);

    try {
      const result = await generateRulesTypeCore(
        plugin.typeName,
        plugin.pluginName,
        plugin.rulePrefix,
      );

      const targetFilePath = path.resolve(
        TYPES_RULES_DIR,
        plugin.outputFileName,
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(targetFilePath, result);
    } catch (error) {
      return { type: 'error', error };
    }
  }

  return { type: 'ok' };
};

const lintFix = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>> => {
  const globResult = await glob(`${TYPES_RULES_DIR}/*.mts`);

  if (Result.isErr(globResult)) {
    return { type: 'error', error: globResult.value };
  }

  const targetFiles = filterTargetFiles(globResult.value, targetFileNames);

  if (Arr.isEmpty(targetFiles)) {
    console.warn('No files to lint');

    return { type: 'ok' };
  }

  const result = await $(
    `TIMING=1 eslint ${[
      '--no-ignore',
      '--fix',
      '--config',
      eslintConfigPath,
    ].join(' ')} ${targetFiles.join(' ')}`,
  );

  if (Result.isErr(result) && result.value.code !== 0) {
    return { type: 'error', error: result.value.stderr };
  }

  return { type: 'ok' };
};

/** 生成対象として指定されたファイル名だけに絞り込む（未指定なら全件） */
const filterTargetFiles = (
  allFiles: readonly string[],
  targetFileNames: NonEmptyArray<string> | undefined,
): readonly string[] =>
  targetFileNames === undefined
    ? allFiles
    : allFiles.filter((filePath) =>
        targetFileNames.some((name) => filePath.endsWith(name)),
      );

const applyTypeTransformationsForTargets = async (
  targetFileNames?: readonly string[],
): Promise<void> => {
  if (targetFileNames === undefined || Arr.isEmpty(targetFileNames)) {
    await applyTypeTransformations();
  } else {
    for (const fileName of targetFileNames) {
      const filePath = path.resolve(TYPES_RULES_DIR, fileName);

      await applyTransformationsToFile(filePath);
    }
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const targetFiles = Arr.skip(process.argv, 2);

  if (Arr.isNonEmpty(targetFiles)) {
    console.info(`Generating specific files: ${targetFiles.join(', ')}`);

    await generateRulesType(targetFiles);
  } else {
    console.info('Generating all files...');

    await generateRulesType();
  }
}
